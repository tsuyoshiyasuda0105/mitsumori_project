$ErrorActionPreference = "SilentlyContinue"

$raw = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($raw)) { exit 0 }

try {
    $payload = $raw | ConvertFrom-Json
} catch {
    exit 0
}

$projectRoot = if ($env:CLAUDE_PROJECT_DIR) {
    $env:CLAUDE_PROJECT_DIR
} elseif ($payload.cwd) {
    [string]$payload.cwd
} else {
    (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}

$toolInput = $payload.tool_input
$filePath = ""
foreach ($name in @("file_path", "path")) {
    if ($toolInput -and ($toolInput.PSObject.Properties.Name -contains $name)) {
        $filePath = [string]$toolInput.$name
        if (-not [string]::IsNullOrWhiteSpace($filePath)) { break }
    }
}

$normalized = $filePath -replace '/', '\'
$scope = "general"
$requiredChecks = @("git status --short", "final report must include deliverables, verification, residual risks, and next action")

if ($normalized -match '(?i)(^|\\)web\\') {
    $scope = "web"
    $requiredChecks = @("npm run build from web/", "visual/browser check for UI changes", "git status --short", "final report with deliverables and residual risks")
} elseif ($normalized -match '(?i)(^|\\)(docs|blog_articles|marketing)\\') {
    $scope = "content"
    $requiredChecks = @("proofread changed content", "check required tables/FAQ/CTA when relevant", "git status --short", "final report with deliverables and next action")
}

$stateDir = Join-Path $projectRoot ".claude\state"
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null

$record = [pscustomobject]@{
    changedAt = (Get-Date).ToUniversalTime().ToString("o")
    path = $filePath
    scope = $scope
    requiredChecks = $requiredChecks
}

$record | ConvertTo-Json -Depth 5 | Set-Content -Encoding utf8 -Path (Join-Path $stateDir "needs-verification.json")

exit 0
