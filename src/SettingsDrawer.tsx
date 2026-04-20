import { useEffect, useState } from 'react'
import {
  DEFAULT_MODEL,
  MODEL_LABELS,
  loadSettings,
  saveSettings,
  type AIModel,
  type AISettings,
} from './aiSettings'

export function SettingsDrawer({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: (s: AISettings) => void
}) {
  const initial = loadSettings()
  const [apiKey, setApiKey] = useState(initial.apiKey)
  const [model, setModel] = useState<AIModel>(initial.model || DEFAULT_MODEL)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  const handleSave = () => {
    const next: AISettings = { apiKey: apiKey.trim(), model }
    saveSettings(next)
    onSaved(next)
    onClose()
  }

  const handleClear = () => {
    setApiKey('')
  }

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2
            id="settings-title"
            className="text-base font-semibold text-slate-800 sm:text-lg"
          >
            ⚙️ 設定
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            閉じる
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                AI API（Anthropic Claude）
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                キーを入力すると、各カードの経緯・ストーリー・まとめがAIで生成されます。未設定なら既存のテンプレート生成にフォールバックします。
              </p>
            </div>

            <div>
              <label
                htmlFor="api-key-input"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Anthropic API Key
              </label>
              <div className="flex items-stretch gap-2">
                <input
                  id="api-key-input"
                  type={show ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm transition hover:bg-slate-100"
                  aria-label="APIキーの表示を切り替える"
                >
                  {show ? '隠す' : '表示'}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  キーはこのブラウザの <code>localStorage</code> にのみ保存されます。
                </p>
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    クリア
                  </button>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="model-select"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                モデル
              </label>
              <select
                id="model-select"
                value={model}
                onChange={(e) => setModel(e.target.value as AIModel)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              >
                {(Object.entries(MODEL_LABELS) as [AIModel, string][]).map(
                  ([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ),
                )}
              </select>
              <p className="mt-2 text-xs text-slate-500">
                Haiku 4.5 は最安・最速。より濃い描写が欲しいときは Sonnet / Opus。
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <p className="font-semibold">⚠️ ブラウザ直叩きの注意</p>
              <ul className="mt-1 list-disc pl-4 space-y-0.5">
                <li>
                  APIキーはブラウザ側に保存されます。共有PCでは使用を控えてください。
                </li>
                <li>
                  ブックマークレット等でキーが抜かれないよう、信頼できる拡張のみ有効にしてください。
                </li>
                <li>
                  Anthropic Console で用途を絞った専用キー・上限設定を推奨します。
                </li>
              </ul>
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            保存
          </button>
        </div>
      </aside>
    </div>
  )
}
