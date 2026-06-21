# =====================================================================
# scripts/db.ps1 — Gestion du PostgreSQL portable local (Windows)
# Usage: powershell -File scripts/db.ps1 [setup|start|stop|status|create|psql]
# =====================================================================
param([Parameter(Position = 0)][string]$Command = 'status')

$Root    = Split-Path $PSScriptRoot -Parent
$PgBin   = Join-Path $Root '.localdb\pgsql\bin'
$PgData  = Join-Path $Root '.localdb\pgdata'
$LogFile = Join-Path $Root '.localdb\pg.log'
$Port    = 5433
$DbName  = 'mep_dev'
$DbUser  = 'postgres'
$DbPass  = 'postgres'

$initdb   = Join-Path $PgBin 'initdb.exe'
$pg_ctl   = Join-Path $PgBin 'pg_ctl.exe'
$psql     = Join-Path $PgBin 'psql.exe'
$createdb = Join-Path $PgBin 'createdb.exe'

function Assert-Binaries {
  if (-not (Test-Path $initdb)) {
    Write-Host "[db] Binaires PostgreSQL absents de $PgBin." -ForegroundColor Red
    Write-Host "[db] Lance d'abord:  npm run db:fetch" -ForegroundColor Yellow
    exit 1
  }
}

function Test-Running {
  $prev = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
  & $pg_ctl status -D $PgData 1>$null 2>$null
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev
  return ($code -eq 0)
}

function Initialize-Cluster {
  Assert-Binaries
  if (Test-Path (Join-Path $PgData 'PG_VERSION')) { return }
  Write-Host "[db] Initialisation du cluster ($PgData)..." -ForegroundColor Cyan
  $pwFile = Join-Path $env:TEMP ('pgpw_' + [guid]::NewGuid().ToString('N') + '.txt')
  Set-Content -Path $pwFile -Value $DbPass -NoNewline -Encoding ascii
  try {
    & $initdb -D $PgData -U $DbUser "--pwfile=$pwFile" --auth=scram-sha-256 --encoding=UTF8 --locale=C
  } finally {
    Remove-Item $pwFile -Force -ErrorAction SilentlyContinue
  }
}

function Ensure-Database {
  $env:PGPASSWORD = $DbPass
  $exists = & $psql -h localhost -p $Port -U $DbUser -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DbName'" 2>$null
  if (($exists | Out-String).Trim() -ne '1') {
    Write-Host "[db] Création de la base '$DbName'..." -ForegroundColor Cyan
    & $createdb -h localhost -p $Port -U $DbUser $DbName
  }
  Write-Host "[db] Base prete: postgresql://$DbUser@localhost:$Port/$DbName" -ForegroundColor Green
}

function Start-Server {
  Assert-Binaries
  Initialize-Cluster
  if (Test-Running) { Write-Host "[db] Deja demarre." -ForegroundColor Green; Ensure-Database; return }
  Write-Host "[db] Demarrage sur le port $Port..." -ForegroundColor Cyan
  & $pg_ctl start -D $PgData -l $LogFile -o "-p $Port" -w
  Ensure-Database
}

function Stop-Server {
  Assert-Binaries
  if (-not (Test-Running)) { Write-Host "[db] Deja arrete." -ForegroundColor Yellow; return }
  & $pg_ctl stop -D $PgData -m fast
}

switch ($Command.ToLower()) {
  'setup'  { Start-Server }
  'start'  { Start-Server }
  'stop'   { Stop-Server }
  'status' { Assert-Binaries; if (Test-Running) { Write-Host '[db] EN MARCHE' -ForegroundColor Green } else { Write-Host '[db] ARRETE' -ForegroundColor Yellow } }
  'create' { Ensure-Database }
  'psql'   { $env:PGPASSWORD = $DbPass; & $psql -h localhost -p $Port -U $DbUser -d $DbName }
  default  { Write-Host 'Usage: db.ps1 [setup|start|stop|status|create|psql]' }
}
