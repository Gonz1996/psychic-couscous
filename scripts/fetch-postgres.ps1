# =====================================================================
# scripts/fetch-postgres.ps1 — Télécharge PostgreSQL portable (Windows)
# Rend le projet reproductible : les binaires (~300 Mo) ne sont PAS
# versionnés ; ce script les réinstalle dans .localdb/pgsql au besoin.
# =====================================================================
$ErrorActionPreference = 'Stop'
$Root   = Split-Path $PSScriptRoot -Parent
$target = Join-Path $Root '.localdb\pgsql'

if (Test-Path (Join-Path $target 'bin\initdb.exe')) {
  Write-Host "[fetch] Binaires deja presents dans $target" -ForegroundColor Green
  exit 0
}

$ver = '17.4-1'
$url = "https://get.enterprisedb.com/postgresql/postgresql-$ver-windows-x64-binaries.zip"
$localdb = Join-Path $Root '.localdb'
New-Item -ItemType Directory -Force -Path $localdb | Out-Null
$zip = Join-Path $localdb 'pg.zip'

Write-Host "[fetch] Telechargement de PostgreSQL $ver..." -ForegroundColor Cyan
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
& curl.exe -L --fail --retry 3 -o $zip $url

$stage = Join-Path $localdb '_stage'
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $stage | Out-Null

Write-Host "[fetch] Extraction..." -ForegroundColor Cyan
& "$env:SystemRoot\System32\tar.exe" -xf $zip -C $stage
Move-Item (Join-Path $stage 'pgsql') $target
Remove-Item $stage -Recurse -Force
Remove-Item $zip -Force
Write-Host "[fetch] Binaires installes dans $target" -ForegroundColor Green
