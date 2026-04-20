export function AILoading({ label }: { label: string }) {
  return (
    <div className="mx-5 mt-5 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-sm text-indigo-800 sm:mx-6">
      <span
        aria-hidden="true"
        className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-indigo-300 border-t-transparent"
      />
      <span>{label}</span>
    </div>
  )
}

export function AIError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="mx-5 mt-5 flex flex-col gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:mx-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">AI生成に失敗しました</p>
        <p className="text-xs text-rose-700/80">{message}</p>
        <p className="text-xs text-rose-700/60">以下はテンプレート生成です。</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 shadow-sm transition hover:bg-rose-100"
      >
        再試行
      </button>
    </div>
  )
}
