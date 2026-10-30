# CLAUDE.md

このリポジトリで作業するときは、最初に README.md を読むこと。

- 作業を始める前に `git fetch --prune origin` で最新を取り込み、main を `origin/main` に合わせる。作業用ブランチを使う場合も、`origin/main` から作り直してから始める。
- ブランチの削除と履歴の書き換え（強制pushを含む）は行わない。

- `index.html` を直接書き換えない。版を上げたファイル（`index_vN.html`）で直し、検証してから反映する。
- 依頼文の形を変えたら、README.md の「直すときの手順」にある検証（`tools/verify_v12/` の `test_v12.mjs` と `test_chat.mjs`）で確認する。`tools/verify_v2.js` は v11 までの依頼文の形用で、v12 以降には使えない。
- 患者情報・実運用のExcel・院内の運用を書いた文書（引き継ぎ書・仕様書）をリポジトリに入れない（公開リポジトリ）。
