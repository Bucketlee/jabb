# jabb — 제로 설정 경량 웹 분석

## 개요

GA 같은 복잡한 설정 없이, 스크립트 한 줄이면 바로 트래킹하는 초경량 웹 분석 서비스.

- **타겟**: 1인 개발자가 사이드 프로젝트에 가볍게 붙여 쓰는 용도
- **핵심 가치**: 계정 없음, 설정 없음, 프로젝트 ID만 정하면 끝

## 사용 흐름

### 1. 추적 추가 (30초)

```html
<script src="https://jabb.vercel.app/t.js" data-project="dasibom"></script>
```

커스텀 이벤트:

```js
jabb('signup_click', { plan: 'free' })
```

### 2. 데이터 보기

CLI:

```bash
npx jabb dasibom
```

웹:

```
jabb.vercel.app/dasibom
```

---

## 인프라 구조

```
[브라우저]
  ├─ t.js 로드 ← Vercel (CDN 캐시)
  ├─ POST /collect → Cloudflare Worker → D1 (SQLite)
  └─ 대시보드 조회 → Vercel Next.js → Worker /query/* → D1

[CLI: npx jabb]  → Vercel API → Worker /query/* → D1
```

| 역할 | 기술 | 이유 |
|------|------|------|
| 수집 API | Cloudflare Workers + D1 | 무료 티어 넉넉, 전역 PoP, rate limit 용이 |
| 대시보드/조회 API | Vercel (Next.js) | SSR + API Routes, 무료 배포 |
| CLI | npm 패키지 (npx) | 의존성 0개, Node 18+ fetch 사용 |

### 수집/조회 분리 이유

- 수집: 트래픽 예측 불가, 남용 가능 → Workers (요청당 과금, 저렴)
- 조회: 본인만 봄, 트래픽 미미 → Vercel 무료 티어 충분

### Vercel ↔ D1 연결

D1은 Workers 바인딩으로만 직접 접근 가능. Worker가 `/query/*` 읽기 전용 엔드포인트를 노출하고, Vercel이 이를 호출하는 프록시 구조.

- Worker `/query/*`는 `WORKER_SECRET`으로 보호 (Vercel만 호출 가능)
- Vercel API Route에서 1분 캐시 (`revalidate: 60`)

---

## 데이터 모델

### events 테이블

```sql
CREATE TABLE events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'pageview',  -- 'pageview' | 'event'
  name       TEXT,                               -- 커스텀 이벤트명
  url        TEXT NOT NULL,
  referrer   TEXT,
  country    TEXT,                               -- CF-IPCountry 헤더
  device     TEXT,                               -- 'mobile' | 'desktop' | 'tablet'
  browser    TEXT,
  visitor    TEXT,                               -- IP+UA+시크릿 해시 (유니크 방문자용)
  meta       TEXT,                               -- JSON, 최대 500B
  day        TEXT NOT NULL,                      -- YYYY-MM-DD (인덱스용 비정규화)
  created    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_project_day ON events (project, day);
CREATE INDEX idx_project_type ON events (project, type, day);
```

### daily_counts 테이블 (rate limit용)

```sql
CREATE TABLE daily_counts (
  project TEXT NOT NULL,
  day     TEXT NOT NULL,
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project, day)
);
```

---

## API 설계

### 수집 (Worker)

```
POST /collect
Content-Type: application/json

{
  "p": "dasibom",           // project (필수)
  "u": "/about",            // url (필수)
  "r": "https://google.com", // referrer
  "t": "pageview",          // type: pageview | event
  "n": "signup_click",      // name (type=event일 때)
  "m": {"plan": "free"}     // meta
}

200 {"ok": true}
429 {"error": "rate_limit"}
400 {"error": "invalid_project"}
```

- 프로젝트 ID 규칙: `^[a-z0-9-]{3,30}$`
- country, device, browser, visitor 해시는 서버에서 추출
- 필드명 축약으로 페이로드 최소화

### 조회 (Worker → Vercel 프록시)

```
GET /query/:project/overview?from=2026-04-01&to=2026-04-15

{
  "total_views": 1234,
  "unique_visitors": 892,
  "top_pages": [{"url": "/", "views": 800}, ...],
  "top_referrers": [{"referrer": "google.com", "views": 300}, ...],
  "daily": [{"day": "2026-04-01", "views": 80}, ...],
  "devices": {"mobile": 600, "desktop": 534, "tablet": 100},
  "countries": {"KR": 900, "US": 200}
}

GET /query/:project/events?from=...&to=...

{
  "events": [{"name": "signup_click", "count": 45}, ...]
}
```

기간 기본값: from = 30일 전, to = 오늘. 최대 90일.

---

## 트래킹 스크립트 (t.js)

목표: <1KB gzipped

### 동작

1. `data-project` 속성에서 프로젝트 ID 추출
2. pageview 자동 수집 (`sendBeacon` 우선, XHR fallback)
3. SPA 지원: `history.pushState` + `popstate` 감지
4. `window.jabb(name, meta)` 글로벌 함수 등록
5. localhost 감지 시 수집 안 함
6. Bot UA 감지 시 수집 안 함

### 수집하지 않는 것

- 쿠키 사용 안 함 → GDPR 배너 불필요
- IP 원본 저장 안 함 (해시 계산에만 사용)
- 핑거프린팅 없음
- 스크린 해상도, 언어 등 미수집
- 체류시간, 스크롤 깊이 미수집

---

## 유니크 방문자

```
visitor = hash(IP + UserAgent + SERVER_SECRET)
```

- 서버시크릿으로 외부 역추적 불가
- IP 원본은 DB에 저장하지 않음
- salt 없음 → cross-day 유니크 추적 가능 (7일/30일 유니크 방문자, 재방문율)
- 같은 사용자가 IP나 브라우저 바뀌면 다른 방문자로 잡힘 (쿠키 없는 한계)

---

## 대시보드 화면

URL: `jabb.vercel.app/{project_id}`

단일 페이지, 스크롤 레이아웃.

```
┌─────────────────────────────────────────────┐
│  jabb / {project_id}         [오늘|7일|30일] │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────┐  ┌──────────┐                 │
│  │ 페이지뷰  │  │ 방문자   │                 │
│  │  1,234   │  │   892    │                 │
│  └──────────┘  └──────────┘                 │
│                                             │
│  ── 일별 추이 (바 차트) ──────────────────── │
│  ▇▇▇▅▅▇▇▇▇▅▅▃▃▇▇                          │
│                                             │
│  ── 상위 페이지 ─────── ── 상위 리퍼러 ──── │
│  /            512       google.com    234   │
│  /blog/hello  298       twitter.com   156   │
│  /about       187       (direct)       98   │
│                                             │
│  ── 디바이스 ────────── ── 브라우저 ──────── │
│  Desktop  72%           Chrome   58%        │
│  Mobile   25%           Safari   28%        │
│  Tablet    3%           Firefox  10%        │
│                                             │
│  ── 국가 ───────────── ── 이벤트 ────────── │
│  KR  456                signup_click  89    │
│  US  312                download      34    │
│                                             │
└─────────────────────────────────────────────┘
```

- 차트: CSS 바 또는 SVG (라이브러리 없음)
- 다크모드 기본, 시스템 설정 따름
- 모바일 반응형
- 프로젝트 없으면 스크립트 설치 가이드 표시

---

## CLI

```bash
npx jabb <project>              # 오늘 요약 (기본)
npx jabb <project> --week       # 7일 요약 + 일별 미니 차트
npx jabb <project> --month      # 30일 요약
npx jabb <project> --events     # 커스텀 이벤트 목록
npx jabb <project> --json       # JSON 출력
```

출력 예시:

```
  jabb · dasibom · 오늘 (2026-04-15)

  페이지뷰     1,234
  방문자        892

  상위 페이지
  /                  512  ██████████████████░░  41%
  /blog/hello        298  ██████████░░░░░░░░░░  24%
  /about             187  ██████░░░░░░░░░░░░░░  15%
  /pricing           143  █████░░░░░░░░░░░░░░░  12%
  /docs              112  ████░░░░░░░░░░░░░░░░   9%
```

의존성 0개. Node.js 내장 fetch (18+)만 사용.

---

## 남용 방어

| 계층 | 방법 | 상한 |
|------|------|------|
| 프로젝트별 일일 | D1 `daily_counts` | 10,000/일 |
| IP별 분당 | Cloudflare Rate Limiting | 60/분 |
| 페이로드 | body 크기 제한 | 2KB |
| 프로젝트 ID | 정규식 검증 | `^[a-z0-9-]{3,30}$` |
| Bot | UA 기반 필터링 | bot 포함 시 무시 |

---

## 데이터 보관

- **90일 보관**, 이후 자동 삭제
- Worker Cron Trigger로 매일 02:00 UTC 실행
- MVP부터 이 정책 명시

---

## 프로젝트 구조

```
jabb/
├── worker/                    # Cloudflare Worker
│   ├── wrangler.toml
│   ├── src/
│   │   ├── index.js          # 라우터
│   │   ├── collect.js        # POST /collect
│   │   ├── query.js          # GET /query/*
│   │   ├── cron.js           # 데이터 정리 (90일)
│   │   └── utils.js          # UA 파싱, 검증, 해싱
│   └── schema.sql
├── web/                       # Next.js (Vercel)
│   ├── app/
│   │   ├── [project]/
│   │   │   └── page.tsx      # 대시보드 UI
│   │   ├── api/
│   │   │   └── [project]/
│   │   │       ├── overview/route.ts
│   │   │       └── events/route.ts
│   │   └── t.js/route.ts     # 트래킹 스크립트 서빙
│   └── package.json
├── cli/                       # npm 패키지
│   ├── bin/cli.js
│   ├── src/
│   │   ├── api.js
│   │   ├── format.js
│   │   └── sparkline.js
│   └── package.json
└── docs/
    └── PLAN.md
```

---

## MVP 범위

### 포함

- [x] 페이지뷰 자동 수집
- [x] 커스텀 이벤트
- [x] SPA 지원 (History API)
- [x] Bot 필터링
- [x] CORS 설정
- [x] 웹 대시보드 (단일 페이지)
- [x] CLI (기본 조회)
- [x] 유니크 방문자 (IP+UA 해시)
- [x] 90일 보관 + 자동삭제
- [x] Rate limiting

### 나중에

- [ ] write_token (데이터 오염 방어)
- [ ] 시간대 선택
- [ ] 데이터 내보내기 (CSV/JSON)
- [ ] 프로젝트 소유권 (DNS TXT 검증)
- [ ] 알림 (트래픽 급증 웹훅)
- [ ] 이벤트 퍼널 분석
- [ ] 시간대별 히트맵

---

## 핵심 결정 & 트레이드오프

| 결정 | 선택 | 트레이드오프 |
|------|------|-------------|
| 인증 없음 | 진입 장벽 제거 | 데이터 오염 가능, 프로젝트 ID 선점 |
| 데이터 공개 | URL만 알면 조회 | 경쟁자가 트래픽 볼 수 있음 |
| 쿠키 미사용 | GDPR 프리 | IP/브라우저 바뀌면 다른 방문자로 잡힘 |
| D1 단일 DB | 운영 단순 | 대규모 트래픽 병목 |
| Worker 프록시 | 보안, 쿼리 관리 집중 | 조회 시 추가 홉 (~50ms) |
| 90일 보관 | D1 무료 티어 유지 | 장기 데이터 분석 불가 |
