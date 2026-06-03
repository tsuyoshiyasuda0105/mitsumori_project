$ErrorActionPreference = "Stop"

$projectRoot = if ($env:CLAUDE_PROJECT_DIR) {
    $env:CLAUDE_PROJECT_DIR
} else {
    (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
}

$docs = @(
    "docs/01_requirements_review.md",
    "docs/06_qa_test_plan.md",
    "docs/10_database_security_design.md",
    "docs/14_database_detail_design.md",
    "docs/15_api_detail_design.md",
    "docs/16_ai_json_schema_design.md",
    "docs/19_mvp_task_priority_matrix.md",
    "docs/21_agent_roster_completion_gates.md"
)

$existingDocs = foreach ($doc in $docs) {
    $path = Join-Path $projectRoot $doc
    if (Test-Path $path) { "- $doc" }
}

@"
PROJECT HOOK CONTEXT: 音声AI見積作成システム

Before work, use the current project rules:
$($existingDocs -join "`n")

Critical gates:
- AI must not fill estimate header fields such as customer, estimate date, salesperson, validity date, or customer-facing notes.
- AI must only create estimate detail candidates.
- Unit must come from the price master. AI must not decide unit.
- Vendor instruction items must be included in Excel output and excluded from customer-facing PDF/output.
- tenant_id must be derived from the authenticated session, not from client input.
- Other companies' customers, estimates, price items, files, AI runs, and recordings must never be visible.
- Every completed task must report: deliverables, changed files, verification, residual risks, and next action.
"@

exit 0
