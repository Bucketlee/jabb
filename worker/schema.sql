CREATE TABLE IF NOT EXISTS events (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  project  TEXT NOT NULL,
  type     TEXT NOT NULL DEFAULT 'pageview',
  name     TEXT,
  url      TEXT NOT NULL,
  referrer TEXT,
  country  TEXT,
  device   TEXT,
  browser  TEXT,
  visitor  TEXT,
  meta     TEXT,
  day      TEXT NOT NULL,
  created  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_project_day  ON events (project, day);
CREATE INDEX IF NOT EXISTS idx_project_type ON events (project, type, day);

CREATE TABLE IF NOT EXISTS daily_counts (
  project TEXT NOT NULL,
  day     TEXT NOT NULL,
  count   INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project, day)
);

-- 프로젝트 소유권: 첫 번째 POST의 Origin이 owner가 됨 (first-write-wins)
CREATE TABLE IF NOT EXISTS projects (
  project      TEXT PRIMARY KEY,
  owner_origin TEXT NOT NULL,
  created_at   INTEGER NOT NULL
);

-- events 테이블의 day 컬럼 단독 인덱스 (날짜 범위 집계 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_events_day ON events (day);
