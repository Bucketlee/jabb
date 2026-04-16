interface InstallGuideProps {
  project: string;
}

export function InstallGuide({ project }: InstallGuideProps) {
  return (
    <div className="py-16 text-center">
      <p className="text-zinc-400 dark:text-zinc-500 mb-2">아직 데이터가 없습니다</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
        HTML에 스크립트를 추가하면 바로 수집을 시작합니다
      </p>
      <pre className="inline-block text-left bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-5 py-4 text-sm overflow-x-auto">
        <code>{`<script src="https://jabb.vercel.app/t.js"
        data-project="${project}"></script>`}</code>
      </pre>
      <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-600">
        스크립트를 추가한 뒤 이 페이지를 새로고침하세요
      </p>
    </div>
  );
}
