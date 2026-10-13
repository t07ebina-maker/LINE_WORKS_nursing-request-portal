# 特定行為依頼窓口（依頼文作成HTML）

院内の看護師・医師が、特定看護師への相談・依頼文を作り、LINE WORKSの「特定行為依頼窓口」へ送るための単一HTMLです。

- 配布用URL：https://t07ebina-maker.github.io/LINE_WORKS_nursing-request-portal/
- 最新版：`index.html`（`index_v7.html` と同じ内容）
- 詳しい経緯・仕様・残課題：[引き継ぎ書_依頼窓口HTML_v2.md](引き継ぎ書_依頼窓口HTML_v2.md) を最初に読む

## ファイル

| ファイル | 内容 |
|---|---|
| `index.html` | 配布用（最新版） |
| `index_v7.html` | 最新版の控え（見比べ用） |
| `archive/` | 旧版（v2〜v6、3ファイル版、3月のサンプル試行、引き継ぎ書v1） |
| `tools/verify_v2.js` | 全経路を自動操作し、依頼文がExcelの読み取り規則で読めるかを確認する |
| `引き継ぎ書_依頼窓口HTML_v2.md` | 引き継ぎ書 |

## 直すときの手順

1. `index.html` を直接直さない。`index_v8.html` のように版を上げたファイルで直す。
2. 検証する（下記）。最終行が `cases 61 fail 0 pageerrors 0` なら合格。
3. 確定したら `index.html` へ反映し、前の版を `archive/` へ移す（`git mv`）。

```
npm i -D playwright
npx playwright install chromium
node tools/verify_v2.js index_v8.html out
```

依頼文の形（項目名・改行・「・」）を変えると、Excelの受付マクロで読めなくなる。形を変えたら、verify_v2.js の確認に加えて、Excel本体（統合版v5.xlsm）でも1件以上登録を確かめる。

## 守ること

- 患者情報を含むファイル（実運用のExcelなど）はリポジトリに入れない。テストは合成データだけ。
- 外部通信・データ送信を加えない（院内で使う前提。依頼者の氏名・連絡先の端末記憶だけ任意で使う）。
- Excel（受付・集計・評価 統合版v5.xlsm）はリポジトリの外（作成者のOneDrive）にある。クラウド環境からは見えないので、Excel側の確認が必要な変更は、ローカルで行う。
