# ══════════════════════════════════════
#  autopush.ps1 — 파일 변경 시 자동 GitHub push
#  실행 방법: PowerShell에서 .\autopush.ps1
#  상태 확인: PowerShell에서 .\autopush.ps1 -Status
# ══════════════════════════════════════

param([switch]$Status)

$repoPath  = $PSScriptRoot
$pidFile   = Join-Path $repoPath ".autopush.pid"

# ── 상태 확인 모드 ──────────────────────
if ($Status) {
    if (Test-Path $pidFile) {
        $savedPid = Get-Content $pidFile
        $proc = Get-Process -Id $savedPid -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host ""
            Write-Host "  🟢 자동 배포 실행 중" -ForegroundColor Green
            Write-Host "  PID : $savedPid" -ForegroundColor Cyan
            Write-Host "  시작 : $($proc.StartTime.ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor Cyan
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "  🔴 자동 배포 꺼져 있음 (프로세스 없음)" -ForegroundColor Red
            Remove-Item $pidFile -ErrorAction SilentlyContinue
            Write-Host ""
        }
    } else {
        Write-Host ""
        Write-Host "  🔴 자동 배포 꺼져 있음" -ForegroundColor Red
        Write-Host ""
    }
    exit
}

# ── 이미 실행 중인지 확인 ───────────────
if (Test-Path $pidFile) {
    $savedPid = Get-Content $pidFile
    $proc = Get-Process -Id $savedPid -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host ""
        Write-Host "  ⚠️  이미 실행 중입니다. (PID: $savedPid)" -ForegroundColor Yellow
        Write-Host "  중복 실행을 방지하기 위해 종료합니다." -ForegroundColor DarkGray
        Write-Host ""
        exit
    }
}

# PID 파일 저장
$PID | Out-File $pidFile -Encoding utf8

Write-Host ""
Write-Host "  ✅ 자동 배포 시작  (PID: $PID)" -ForegroundColor Green
Write-Host "  📁 감지 폴더 : $repoPath" -ForegroundColor Cyan
Write-Host "  📄 감지 파일 : index.html, style.css, script.js" -ForegroundColor Cyan
Write-Host "  🔁 파일을 저장하면 GitHub에 자동으로 업로드됩니다." -ForegroundColor Yellow
Write-Host "  🔍 상태 확인  : .\autopush.ps1 -Status" -ForegroundColor DarkGray
Write-Host "  ⛔ 종료        : Ctrl+C" -ForegroundColor DarkGray
Write-Host ""

# ── FileSystemWatcher 설정 ──────────────
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $repoPath
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite

$lastPush = [DateTime]::MinValue
$cooldown = 3

$action = {
    $name = $Event.SourceEventArgs.Name
    $ext  = [System.IO.Path]::GetExtension($name)
    if ($ext -notin @(".html", ".css", ".js")) { return }

    $now  = [DateTime]::Now
    if (($now - $script:lastPush).TotalSeconds -lt $script:cooldown) { return }
    $script:lastPush = $now

    $ts = $now.ToString("HH:mm:ss")
    Write-Host "  [$ts] 변경 감지: $name" -ForegroundColor Magenta

    Set-Location $script:repoPath
    $status = git status --porcelain 2>&1
    if (-not $status) {
        Write-Host "  [$ts] 변경사항 없음, 건너뜀." -ForegroundColor DarkGray
        return
    }

    git add index.html style.css script.js 2>&1 | Out-Null
    git commit -m "update: $name ($ts)" 2>&1 | Out-Null
    $result = git push 2>&1

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [$ts] ✅ GitHub push 완료!" -ForegroundColor Green
    } else {
        Write-Host "  [$ts] ❌ Push 실패: $result" -ForegroundColor Red
    }
}

Register-ObjectEvent $watcher Changed -Action $action | Out-Null
Register-ObjectEvent $watcher Created -Action $action | Out-Null

# ── 종료 처리 ──────────────────────────
try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Remove-Item $pidFile -ErrorAction SilentlyContinue
    Write-Host "`n  🔴 자동 배포가 종료되었습니다." -ForegroundColor DarkGray
}
