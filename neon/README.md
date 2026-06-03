# Neon

This directory contains database operation assets for the Mitsumori project.

## Layout

```text
neon/
  README.md
  migrations/
    202606020001_core_schema.sql
```

## Rules

- Do not commit production secrets.
- Apply migrations to a Neon staging/preview branch before production.
- Use a migration/admin role for schema changes and a separate runtime role for the Next.js API.
- Store the production `DATABASE_URL` in Vercel environment variables, not in source files.
- Record production checks in `docs/30_neon_production_checklist.md`.

## Current Migration

`neon/migrations/202606020001_core_schema.sql` defines the core schema used by the estimate save API.