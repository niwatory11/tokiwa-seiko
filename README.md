# 常盤精工株式会社(ときわせいこう)

> **Concept Project** — 本サイトはフロントエンド制作の実績提示を目的とした架空企業のコンセプトサイトです。「常盤精工株式会社」は実在せず、掲載している住所・電話番号・設備・加工例はすべて架空の設定です。フォームからの送信は行われません。

架空のB2B精密部品加工会社(町工場)のコーポレートサイト。
React + TypeScript + Vite による1ページ構成のレスポンシブサイトです。

姉妹作 [菓寮 月白](https://github.com/niwatory11/kario-tsukishiro)(世界観・情緒型の高級商材サイト)に対し、本作は**明快さ・信頼型のB2Bサイト**として設計軸を対比させた2作目です。

![常盤精工 ファーストビュー](docs/screenshots/hero-1440.png)

## デザインコンセプト

**「図面のように、話す。」**

B2B製造業の共通言語である機械図面の様式を、そのままデザイン言語にしています。

- **方眼・寸法線・公差表記・表題欄**: ヒーローは白図面の方眼の上に組み、架空企業である旨の注記も図面の「表題欄」の様式で明示
- **配色**: 白図面の紙色×墨×**常盤色**(社名と同源の伝統色。常緑=「変わらない品質」の宣言)。朱色は検印スタンプとフォームエラーのみ
- **タイポグラフィ**: IBM Plex Sans JP。寸法・型番・図番など数値はすべて IBM Plex Mono の等幅で組む
- **加工例は写真ではなく自作SVGの機械図面**(二面図・断面ハッチング・寸法線・公差)で提示
- **角丸ゼロ**(`--radius: 0`)。図面に角丸はない
- 製造業サイトの定番(紺+オレンジ、工場写真、歯車アイコン)は意図的に不使用

## 主な機能

- 固定ヘッダー+右端に常設の見積もりCTA(B2Bの定石)
- モバイルドロワーナビゲーション(フォーカストラップ・Escapeで閉じる・背面スクロールロック)
- 設備一覧のスペック表・対応材質表(検証可能な具体で信頼を作る)
- 見積もり依頼フォーム(フロントエンドバリデーション)
  - メール・電話形式、希望納期は「7日後〜180日後」の境界検証
  - blur時+送信時の検証、エラーサマリーからの各項目リンク、`aria-invalid` / `aria-describedby`
- スキップリンク、セマンティックHTML、キーボード操作対応、`prefers-reduced-motion` 対応

## 技術構成

| 領域 | 採用技術 |
|---|---|
| フレームワーク | React 19 + TypeScript(strict) |
| ビルド | Vite 8 |
| スタイル | CSS Modules + CSS Custom Properties(デザイントークン) |
| フォント | @fontsource(セルフホスト・unicode-rangeスライス配信) |
| テスト | Vitest + Testing Library(25件) |
| lint | oxlint |

アニメーションライブラリ・CSSフレームワークは使用していません(依存は最小限)。

## セットアップ

```bash
npm install
npm run dev        # http://localhost:5173
```

## 開発コマンド

```bash
npm run lint       # oxlint
npm run typecheck  # tsc -b(TypeScript strict)
npm run test       # vitest(バリデーション・フォーム・ドロワー・スモーク)
npm run build      # 型チェック + production build(dist/)
npm run preview    # production buildの確認
```

## レスポンシブ対応

360 / 375 / 768 / 1024 / 1440px で表示確認済み(横スクロールなしを機械検査)。
設備表・図面SVG・フォームはモバイル向けに別レイアウトで設計しています。

## アクセシビリティ

- ランドマークと `aria-labelledby` によるセクション構造、h1〜h3の正しい階層
- スキップリンク、`:focus-visible` のフォーカスリング
- ドロワーのフォーカストラップとフォーカス返却
- 装飾SVGは `aria-hidden`、意味のある図面SVGは `role="img"` + 説明
- 本文コントラスト4.5:1以上、タップ領域44px以上
- `prefers-reduced-motion: reduce` でアニメーション・smooth scrollを無効化

## 設計根拠(市場調査ベース)

商業サイト12件の市場調査から抽出した設計原則(B2Bは情報階層と摩擦の少ない導線が信頼を生む/信頼は検証可能な具体で作る/業界クリシェを避ける、など)をもとに設計しています。原則と実装の対応は [docs/design-rationale.md](docs/design-rationale.md) を参照してください。

## デプロイ

`main` ブランチへのpushで、GitHub Actions(`.github/workflows/deploy.yml`)がlint・テスト・buildを実行し、GitHub Pagesへ自動デプロイします。

- ライブデモ: https://niwatory11.github.io/tokiwa-seiko/
- サブパス配信のため `vite.config.ts` で `base: '/tokiwa-seiko/'` を設定済み(リポジトリ名を変えた場合はここも変更)

他の静的ホスティング(Netlify / Vercel等)へは `npm run build` の `dist/` をそのまま配置できます(その場合 `base` を `'/'` に戻してください)。

## ライセンス・注意

個人ポートフォリオ用のコンセプト作品です。文章・SVG図面を含む全アセットは本リポジトリのために制作したものです。
