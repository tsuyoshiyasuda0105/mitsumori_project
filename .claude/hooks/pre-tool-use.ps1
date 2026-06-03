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

$rules = @(
    @{ Pattern = '(?i)\bgit\s+reset\s+--hard\b'; Reason = 'git reset --hard is blocked. Do not discard user or agent work without explicit approval.' },
    @{ Pattern = '(?i)\bgit\s+checkout\s+--\b'; Reason = 'git checkout -- is blocked because it can discard local changes.' },
    @{ Pattern = '(?i)\bgit\s+clean\s+-[^\s]*f'; Reason = 'git clean -f is blocked because it can delete untracked project files.' },
    @{ Pattern = '(?i)\brm\s+-rf\b'; Reason = 'rm -rf is blocked by the project safety hook.' },
    @{ Pattern = '(?i)\bremove-item\b.*\b-recurse\b'; Reason = 'Recursive Remove-Item is blocked unless the user explicitly approves the exact target.' },
    @{ Pattern = '(?i)\brmdir\s+/s\b'; Reason = 'Recursive rmdir is blocked by the project safety hook.' },
    @{ Pattern = '(?i)\bdel\s+/s\b'; Reason = 'Recursive del is blocked by the project safety hook.' },
    @{ Pattern = '(?i)\b(type|cat|get-content)\b.*(^|[\\/])?\.env($|[\s\.\-_])'; Reason = 'Reading .env files is blocked to avoid exposing secrets.' },
    @{ Pattern = '(?i)\bvercel\s+env\s+pull\b'; Reason = 'vercel env pull can expose production secrets. Ask the user before running it.' }
)

foreach ($rule in $rules) {
    if ($command -match $rule.Pattern) {
        [Console]::Error.WriteLine("Blocked by mitsumori_project hook: $($rule.Reason)`nCommand: $command")
        exit 2
    }
}

exit 0
