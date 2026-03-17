$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Copy-Item ".\看護師向け_脱水チェック_CDSS.html" ".\index.html" -Force

Write-Host ""
Write-Host "GitHub Pages 公開前チェックを実行しました。" -ForegroundColor Green
Write-Host "同期済み: 看護師向け_脱水チェック_CDSS.html -> index.html"
Write-Host ""
Write-Host "次の手順:"
Write-Host "1. git add ."
Write-Host "2. git commit -m ""Update CDSS"""
Write-Host "3. git push"
Write-Host "4. GitHub の Settings > Pages で main / root を公開設定"
Write-Host ""
