$ErrorActionPreference = "SilentlyContinue"

$raw = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($raw)) { exit 0 }

try {
    $payload = $raw | ConvertFrom-Json
} catch {
    exit 0
}

$command = [string]$payload.tool_input.command
if ([string]::IsNullOrWhiteSpace($command)) { exit 0 }

$projectRoot = if ($env:CLAUDE_PROJECT_DIR) {
    $env:CLAUDE_PROJECT_DIR
} elseif ($payload.cwd) {
    [string]$payload.cwd
} else {
    (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}

$verificationPatterns = @(
    '(?i)\bnpm\s+run\s+build\b',
    '(?i)\bnpm\s+run\s+lint\b',
    '(?i)\bnpm\s+test\b',
    '(?i)\bpnpm\s+test\b',
    '(?i)\byarn\s+test\b',
    '(?i)\bnpx\s+next\s+build\b',
    '(?i)\btsc\b',
    '(?i)\bgit\s+status\b'
)

$matched = $false
foreach ($pattern in $verificationPatterns) {
    if ($command -match $pattern) {
        $matched = $true
        break
    }
}

if ($matched) {
    $stateDir = Join-Path $projectRoot ".claude\state"
    New-Item -ItemType Directory -Force -Path $stateDir | Out-Null
    $record = [pscustomobject]@{
        verifiedAt = (Get-Date).ToUniversalTime().ToString("o")
        command = $command
    }
    $record | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 -Path (Join-Path $stateDir "last-verification.json")
}

exit 0
