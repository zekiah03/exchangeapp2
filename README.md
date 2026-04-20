# 反転人間紹介アプリ

「あなたが辛いと感じることを、好きだと感じる人間がどこかに実在する」
という多様性の気づきを与える、1画面3タブのシンプルなWebアプリ。

## スタック
- Vite + React 19 + TypeScript
- Tailwind CSS v3
- 状態管理: `useState` のみ（外部ライブラリなし）
- デプロイ: Vercel（zero-config）

## 開発
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 型チェック + 本番ビルド
npm run preview  # 本番ビルドをローカルで確認
```

## デプロイ（Vercel）
1. Vercelで本リポジトリを Import
2. Framework は `Vite` が自動検出される（`vercel.json` も同梱）
3. Build Command: `npm run build` / Output: `dist`

## 構成
```
src/
  App.tsx               3タブ + 反転ロジック + 結果カード
  StructureAnalysis.tsx 構造分析タブの静的コンテンツ
  index.css             Tailwindエントリ
  main.tsx              Reactエントリ
```
