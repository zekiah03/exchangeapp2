import { useState } from 'react'

const STEPS = [
  {
    key: 'words',
    label: '① ことば',
    body: '「好き」と「辛い」を1行ずつ書きだす。',
  },
  {
    key: 'ask',
    label: '② きく',
    body: 'AIがあなたに質問。選択肢をクリックするだけでOK（補足は任意）。',
  },
  {
    key: 'see',
    label: '③ 見る',
    body: 'あなたの回答から、いま立っている軸と位置を可視化。',
  },
  {
    key: 'take',
    label: '④ 持ち帰る',
    body: 'で、どうしたい？ を聞いて、あなた用の気付きを返す。',
  },
]

export function Intro() {
  const [open, setOpen] = useState(false)
  return (
    <section
      aria-labelledby="intro-heading"
      className="mb-4 overflow-hidden rounded-2xl border border-indigo-100 bg-white/70 shadow-sm backdrop-blur"
    >
      <div className="px-5 py-4 sm:px-6">
        <p
          id="intro-heading"
          className="text-xs font-medium uppercase tracking-wide text-indigo-600"
        >
          このアプリは
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700 sm:text-base">
          あなたの「好き」と「辛い」の裏側にある、
          <span className="font-semibold text-slate-900">
            同じ軸の別の位置
          </span>
          を、質問と回答だけで見にいく4ステップ。
        </p>
        <p className="mt-1 text-xs text-slate-500">
          反転は「別人の話」ではなく、あなた自身の中の別の位置のこと。
        </p>
      </div>

      <div className="border-t border-indigo-100 bg-white/50">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="intro-steps"
          className="flex w-full items-center justify-between gap-2 px-5 py-3 text-left text-xs font-medium text-indigo-700 transition hover:bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:px-6 sm:text-sm"
        >
          <span>
            {open ? '閉じる' : '流れを見る（4ステップ）'}
          </span>
          <span
            aria-hidden="true"
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          >
            ▾
          </span>
        </button>
        {open && (
          <ol
            id="intro-steps"
            className="space-y-2 border-t border-indigo-100 px-5 py-4 text-sm text-slate-700 sm:px-6"
          >
            {STEPS.map((s) => (
              <li key={s.key} className="flex gap-3">
                <span className="shrink-0 font-semibold text-indigo-700">
                  {s.label}
                </span>
                <span className="text-slate-600">{s.body}</span>
              </li>
            ))}
            <li className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-slate-700">
              📐 目標は全軸を「内発・報酬側」に寄せることではありません。
              動かしたい1つの軸を、半歩動かすだけで十分です。
            </li>
            <li className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              💡 APIキー未設定でもテンプレートで体験できます。
              キーを入れると、質問と気付きがあなたの回答に合わせた文面になります。
            </li>
          </ol>
        )}
      </div>
    </section>
  )
}
