# jabb

제로 설정 경량 웹 분석.

```html
<script src="https://jabb.vercel.app/t.js" data-project="my-project"></script>
```

계정 없음, 설정 없음. 스크립트 한 줄로 페이지뷰와 커스텀 이벤트를 수집한다.

공급망 무결성을 강화하려면 대시보드가 제공하는 `integrity` 해시가 포함된 스니펫을 사용한다. 트래커 본문이 변경될 때마다 해시도 갱신된다.

## 구성

- `worker/` — Cloudflare Worker (수집 + 조회 API, D1 저장)
- `web/` — Next.js 대시보드 + 트래킹 스크립트 + API 프록시
- `cli/` — `npx jabb <project>` CLI

기획서: [docs/PLAN.md](./docs/PLAN.md)
