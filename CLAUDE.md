# 常盤精工 — プロジェクトルール

架空のB2B精密部品加工会社「常盤精工株式会社(ときわせいこう)」の単体商業Webサイト。
フロントエンド制作実績(Concept Project)としてGitHub・ライブデモで公開する。
姉妹作「菓寮 月白」(世界観・情緒型)に対し、本作は市場調査の「明快さ・信頼型」軸を実装する。

## 成果物の定義

- 最終成果物は**単体の商業Webサイト**である
- Instagram分析サイト・ダッシュボード・スクレイピング管理画面は作らない
- 特定の実在サイトのコピーをしない
- ReelsやSNSの画像・動画・スクリーンショットを転載しない
- 利用条件を確認できる素材だけを使用する(現状はすべて自作SVG/CSS)

## 品質基準

- レスポンシブ必須。360 / 375 / 768 / 1024 / 1440px で横スクロールが出ないこと
- アクセシビリティ必須(セマンティックHTML、キーボード操作、フォーカス表示、alt、`prefers-reduced-motion`)
- TypeScriptエラーを残さない(`npm run typecheck`)
- `npm run lint` と `npm run build` を通す
- 変更後は必ずブラウザ表示を確認する
- 作業を計画だけで終了しない

## コンテンツのルール

- 架空企業である旨をヒーロー・フッター・READMEに明記し続ける
- 実在しない受賞歴・取引社数・売上・口コミ・導入実績を事実のように書かない
  (会社概要の設立年・従業員数などは架空の設定として記載可。実在企業・実在機械メーカー名は出さない)
- Lorem ipsum等の仮テキストを置かない
- 秘密情報・Cookie・個人情報・Instagramの生データをコミットしない(`research/` は .gitignore 済み)

## デザインコンセプト「図面のように、話す」

- B2Bの共通言語である機械図面の様式(方眼・寸法線・公差表記・表題欄・図番)をデザイン言語化する
- 配色は白図面の紙色×墨×**常盤色**(社名と同源の伝統色=変わらない品質)。朱色は検印とエラー表示のみ
- 製造業クリシェ(紺+オレンジ、工場写真、歯車アイコン)を使わない
- 数値・型番・図番は等幅(IBM Plex Mono)で組む

## 実装規約

- デザイントークンは `src/styles/tokens.css` が単一情報源。色値の直書き禁止(自作SVG図面内のみ例外)
- 角丸は使わない(`--radius: 0`)。図面に角丸はない
- ブレークポイントは 480 / 768 / 1024 / 1280px の生値をモバイルファースト(`min-width`)で統一
- 共通レイアウトは `global.css` の `.container` / `.section`、装飾はCSS Modules側に書く
- モーションは「製図の手つき」に限定: リビール(フェード+12px上昇)/ SVG線画(`pathLength={1}` + stroke-dashoffset。ロード時のロゴ線画を含む)/ 罫線・下線の scaleX/scaleY ドロー(スクロール時は transition+`[data-visible]`、ロード時は keyframes+`both`。隠し状態は `from` にのみ書く)/ 行の段差フェード(nth-child 遅延)/ 検印の押印 / 検図の指摘(フォームのエラー・サマリー出現=フェード+4px上昇のリビール縮小形、`--dur-quick`。完了ボックスは通常リビール)/ ホバー・フォーカスは色変化のみ(`--dur-quick`。フォームの `:focus-within` ラベル色を含む。持ち上げ・影は使わない)。機能的モーション(ドロワー開閉等)は `--dur-slide` を使う。例外: 退場アニメーション(animationend で直後にアンマウントするもの。ドロワー退場等)に限り keyframes の `to` に隠し状態を書いてよい(reduced-motion では 0.01ms で完走して即アンマウントされるため安全)。時間・イージングは `tokens.css` の `--dur-*` / `--ease-*` を使う。スクロール連動の演出は `useReveal` 経由、ナビの現在地表示は `useScrollSpy`(`aria-current="location"`。機能的表示のため reduced-motion でも動作を維持)経由のみ。reduced-motion では duration と delay の両方が無効化されることを必ず確認
- コピー(文言・数値)は `src/data/` に置き、コンポーネントに直書きしない

## コマンド

```bash
npm run dev        # 開発サーバー
npm run lint       # oxlint
npm run typecheck  # tsc -b
npm run test       # vitest
npm run build      # 型チェック + production build
npm run preview    # buildの確認
```

## 禁止事項

- `git push`・公開デプロイ・外部サービスへの送信は、ユーザーの明示的な許可なしに行わない
