# Neon Production Checklist

| Item | Value |
| --- | --- |
| Scope | Neon DB setup and production verification for the estimate save API |
| Related setup doc | `docs/28_database_save_api_setup.md` |
| Related migration | `neon/migrations/202606020001_core_schema.sql` |
| Last updated | 2026-06-03 |

## 1. Before Production

- [ ] Neon project or production branch is created.
- [ ] `neon/migrations/202606020001_core_schema.sql` is applied to a staging/preview branch first.
- [ ] Required extension `pgcrypto` is available if the migration uses `gen_random_uuid()`.
- [ ] Runtime DB role is separate from the owner or migration role.
- [ ] Production `DATABASE_URL` is stored only in Vercel environment variables.
- [ ] No password, token, or connection string is committed to the repository.
- [ ] Vercel production deployment is restarted after setting `DATABASE_URL`.

## 2. Expected Runtime Behavior

| Condition | Expected behavior |
| --- | --- |
| `DATABASE_URL` is not set | `/api/estimates` returns local fallback mode and UI keeps localStorage save |
| `DATABASE_URL` is set and schema exists | `/api/estimates` returns database mode and estimates persist in Neon |
| DB connection fails | API returns a safe error without exposing secrets |
| Unknown price/customer IDs | API rejects invalid input or uses seeded demo records only when intended |

## 3. Connection Verification SQL

```sql
select
  current_database() as database_name,
  current_user as connected_user,
  now() as checked_at;
```

```sql
select ssl, version, cipher
from pg_stat_ssl
where pid = pg_backend_pid();
```

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'tenants',
    'users',
    'customers',
    'price_items',
    'estimates',
    'estimate_lines',
    'ai_analysis_runs',
    'files',
    'export_jobs',
    'audit_logs',
    'meeting_recordings'
  )
order by table_name;
```

## 4. API Verification

```powershell
Invoke-WebRequest https://web-beryl-one-79.vercel.app/api/estimates -UseBasicParsing
```

Expected after DB setup:

```json
{
  "mode": "database"
}
```

Expected before DB setup:

```json
{
  "mode": "local"
}
```

## 5. Release Gate

- [ ] Create a sample estimate from the deployed app.
- [ ] Reload the list page and confirm the estimate remains visible.
- [ ] Confirm API response does not contain `????` or mojibake.
- [ ] Confirm another tenant cannot be selected from the client request.
- [ ] Confirm `/sitemap.xml` and `/robots.txt` are accessible after deploy.