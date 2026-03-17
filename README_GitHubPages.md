# GitHub Pages 公開手順

このフォルダは、そのまま GitHub Pages で公開できる構成です。

## 公開対象ファイル

- `index.html`
- `看護師向け_脱水チェック_CDSS.html`
- `.nojekyll`

GitHub Pages の公開URLは `index.html` が入口になります。

## 事前確認

1. 公開したい最新版が [index.html](C:/Users/Owner/OneDrive/⑭Codex作業フォルダ/index.html) に入っていることを確認する
2. 基準ファイル [看護師向け_脱水チェック_CDSS.html](C:/Users/Owner/OneDrive/⑭Codex作業フォルダ/看護師向け_脱水チェック_CDSS.html) と内容差がないことを確認する

## GitHub で新規公開する手順

1. GitHub で新しい公開リポジトリを作成する
2. このフォルダの中身をそのリポジトリへ配置する
3. GitHub のリポジトリ画面で `Settings` を開く
4. 左メニューの `Pages` を開く
5. `Build and deployment` の `Source` を `Deploy from a branch` にする
6. Branch を `main`、Folder を `/ (root)` にする
7. `Save` を押す
8. 数分待つ
9. `Your site is live at ...` と表示されたURLを開く

## 公開URLの形

通常は次の形です。

- `https://<GitHubユーザー名>.github.io/<リポジトリ名>/`

例:

- `https://example.github.io/fluid-cdss/`

## 更新手順

1. [看護師向け_脱水チェック_CDSS.html](C:/Users/Owner/OneDrive/⑭Codex作業フォルダ/看護師向け_脱水チェック_CDSS.html) を更新する
2. `index.html` に同じ内容を反映する
3. GitHub にコミットして push する
4. 1〜2分待って公開ページを再読込する

## コマンド例

PowerShell 例:

```powershell
Copy-Item .\看護師向け_脱水チェック_CDSS.html .\index.html -Force
git init
git add .
git commit -m "Initial GitHub Pages publish"
git branch -M main
git remote add origin https://github.com/<GitHubユーザー名>/<リポジトリ名>.git
git push -u origin main
```

更新時:

```powershell
Copy-Item .\看護師向け_脱水チェック_CDSS.html .\index.html -Force
git add .
git commit -m "Update CDSS"
git push
```

## 補足

- `.nojekyll` を置いているので、GitHub Pages で余計な Jekyll 処理が入りません
- 単一HTML構成なので、別回線からでも同じ公開URLで開けます
- 画面が更新されない場合は、スマホで再読込かキャッシュ削除を行ってください

