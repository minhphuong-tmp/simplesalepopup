# Script khởi động môi trường dev
# Chạy: .\start-dev.ps1

$ROOT = $PSScriptRoot

Write-Host "=== Khởi động Firebase Emulators ===" -ForegroundColor Cyan
$env:GOOGLE_APPLICATION_CREDENTIALS = "$ROOT\serviceAccount.development.json"
$env:NODE_ENV = "development"

# Mở terminal mới cho emulators
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT'; `$env:GOOGLE_APPLICATION_CREDENTIALS='$ROOT\serviceAccount.development.json'; `$env:NODE_ENV='development'; .\node_modules\.bin\firebase emulators:start --only hosting,functions,pubsub"

# Mở terminal mới cho esbuild watch (functions)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT'; yarn workspace @avada/functions run watch"

# Mở terminal riêng để theo dõi URL tunnel và tự động resync ScriptTag
Start-Process powershell -ArgumentList "-NoExit", "-Command", @"
cd '$ROOT'
Write-Host '=== ScriptTag Auto-Resync ===' -ForegroundColor Magenta
Write-Host 'Dang cho URL tunnel duoc cap nhat...' -ForegroundColor Yellow
`$envFile = '$ROOT\packages\functions\.env'
`$lastUrl = ''
while (`$true) {
    Start-Sleep -Seconds 5
    if (Test-Path `$envFile) {
        `$content = Get-Content `$envFile -Raw
        if (`$content -match 'APP_BASE_URL=(.+)') {
            `$currentUrl = `$Matches[1].Trim()
            if (`$currentUrl -ne `$lastUrl -and `$currentUrl -ne '') {
                `$lastUrl = `$currentUrl
                Write-Host ('URL moi: ' + `$currentUrl) -ForegroundColor Green
                Write-Host 'Dang resync ScriptTag...' -ForegroundColor Cyan
                node '$ROOT\scripts\resync-scripttag.js'
                if (`$LASTEXITCODE -eq 0) {
                    Write-Host 'Resync thanh cong! Dang rebuild bundle...' -ForegroundColor Green
                    yarn --cwd '$ROOT/packages/scripttag' run build:dev
                    if (`$LASTEXITCODE -eq 0) {
                        Write-Host 'Done! Hard refresh browser (Ctrl+Shift+R) de ap dung.' -ForegroundColor Green
                    } else {
                        Write-Host 'Build that bai. Chay tay: yarn workspace @avada/scripttag run build:dev' -ForegroundColor Red
                    }
                } else {
                    Write-Host 'Resync that bai. Chay tay: npm run resync-scripttag' -ForegroundColor Red
                }
            }
        }
    }
}
"@

Write-Host "=== Khởi động Shopify Dev ===" -ForegroundColor Green
Write-Host "Chạy 'npm run dev' trong terminal này..." -ForegroundColor Yellow
npm run dev

