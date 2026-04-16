export default function HomePage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-20">
      <div className="mb-16">
        <h1 className="text-2xl font-semibold tracking-tight mb-3">jabb</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          계정 없음. 설정 없음. 스크립트 한 줄이면 끝.
        </p>
      </div>

      <section className="mb-14">
        <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6">
          시작하기
        </h2>
        <ol className="space-y-8">
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs font-semibold flex items-center justify-center">
              1
            </span>
            <div>
              <p className="text-sm font-medium mb-2.5">HTML에 스크립트 추가</p>
              <pre className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm overflow-x-auto">
                <code className="text-zinc-700 dark:text-zinc-300">{`<script src="https://jabb.vercel.app/t.js"
        data-project="my-project"></script>`}</code>
              </pre>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs font-semibold flex items-center justify-center">
              2
            </span>
            <div>
              <p className="text-sm font-medium mb-2.5">대시보드 확인</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                <code className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-0.5">
                  jabb.vercel.app/my-project
                </code>
                {' '}에서 바로 조회
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-xs font-semibold flex items-center justify-center">
              3
            </span>
            <div>
              <p className="text-sm font-medium mb-2.5">커스텀 이벤트 (선택)</p>
              <pre className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm overflow-x-auto">
                <code className="text-zinc-700 dark:text-zinc-300">{`jabb('signup_click', { plan: 'free' })`}</code>
              </pre>
            </div>
          </li>
        </ol>
      </section>

      <section className="mb-14">
        <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6">
          CLI
        </h2>
        <pre className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm overflow-x-auto">
          <code className="text-zinc-700 dark:text-zinc-300">{`npx jabb my-project
npx jabb my-project --week
npx jabb my-project --month`}</code>
        </pre>
      </section>

      <section>
        <h2 className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-6">
          특징
        </h2>
        <ul className="space-y-2.5 text-sm text-zinc-500 dark:text-zinc-400">
          <li>쿠키 미사용 — GDPR 배너 불필요</li>
          <li>IP 원본 저장 안 함 — 해시만 보관</li>
          <li>Bot 자동 필터링</li>
          <li>SPA (React, Vue 등) 지원</li>
          <li>90일 보관 후 자동 삭제</li>
          <li>프로젝트당 일 10,000건 무료</li>
        </ul>
      </section>
    </main>
  );
}
