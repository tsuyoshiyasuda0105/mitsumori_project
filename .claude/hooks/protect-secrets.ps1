$ErrorActionPreference = "SilentlyContinue"

$raw = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($raw)) { exit 0 }

try {
    $payload = $raw | ConvertFrom-Json
} catch {
    exit 0
}

$toolInput = $payload.tool_input
if ($null -eq $toolInput) { exit 0 }

$pathCandidates = @()
foreach ($name in @("file_path", "path", "notebook_path")) {
    if ($toolInput.PSObject.Properties.Name -contains $name) {
        $value = [string]$toolInput.$name
        if (-not [string]::IsNullOrWhiteSpace($value)) {
            $pathCandidates += $value
        }
    }
}

$blockedPathPatterns = @(
    '(?i)(^|[\\/])\.env($|[.\-_\s])',
    '(?i)\.pem$',
    '(?i)\.key$',
    '(?i)\.p12$',
    '(?i)service[_-]?role'
)

foreach ($path in $pathCandidates) {
    foreach ($pattern in $blockedPathPatterns) {
        if ($path -match $pattern) {
            [Console]::Error.WriteLine("Blocked by mitsumori_project hook: access to secret-like file paths is not allowed. Path: $path")
            exit 2
        }
    }
}

exit 0
