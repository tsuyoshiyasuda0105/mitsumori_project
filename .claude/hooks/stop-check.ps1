$ErrorActionPreference = "SilentlyContinue"

$raw = [Console]::In.ReadToEnd()
try {
    $payload = if ([string]::IsNullOrWhiteSpace($raw)) { $null } else { $raw | ConvertFrom-Json }
} catch {
    $payload = $null
}

$projectRoot = if ($env:CLAUDE_PROJECT_DIR) {
    $env:CLAUDE_PROJECT_DIR
} elseif ($payload -and $payload.cwd) {
    [string]$payload.cwd
} else {
    (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}

$stateDir = Join-Path $projectRoot ".claude\state"
$needsPath = Join-Path $stateDir "needs-verification.json"
$lastVerificationPath = Join-Path $stateDir "last-verification.json"

if (-not (Test-Path $needsPath)) { exit 0 }

try {
    $needs = Get-Content -Raw -Encoding utf8 $needsPath | ConvertFrom-Json
} catch {
    exit 0
}

$hasFreshVerification = $false
if (Test-Path $lastVerificationPath) {
    try {
        $last = Get-Content -Raw -Encoding utf8 $lastVerificationPath | ConvertFrom-Json
        $changedAt = [datetime]$needs.changedAt
        $verifiedAt = [datetime]$last.verifiedAt
        if ($verifiedAt -ge $changedAt) {
            $hasFreshVerification = $true
        }
    } catch {
        $hasFreshVerification = $false
    }
}

if (-not $hasFreshVerification) {
    $checks = if ($needs.requiredChecks) { ($needs.requiredChecks -join "`n- ") } else { "git status --short" }
    [Console]::Error.WriteLine(@"
Blocked by mitsumori_project Stop hook: edited files have not been verified yet.

Changed file:
$($needs.path)

Required before final response:
- $checks

Also include in the final report:
- deliverables
- changed files
- verification result
- residual risks or "none"
- next action
"@)
    exit 2
}

exit 0
