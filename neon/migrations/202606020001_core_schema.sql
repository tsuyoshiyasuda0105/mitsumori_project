create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan_code text not null default 'free',
  status text not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  feature_flags jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ck_tenants_status check (status in ('active', 'suspended', 'cancelled')),
  constraint ck_tenants_feature_flags_object check (jsonb_typeof(feature_flags) = 'object')
);

create unique index uq_tenants_stripe_customer_id
  on tenants (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index uq_tenants_stripe_subscription_id
  on tenants (stripe_subscription_id)
  where stripe_subscription_id is not null;

create trigger trg_tenants_updated_at
before update on tenants
for each row execute function set_updated_at();

create table users (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  auth_provider text not null,
  auth_subject text not null,
  email text not null,
  name text not null,
  role text not null default 'member',
  permissions jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_users_auth unique (auth_provider, auth_subject),
  constraint ck_users_role check (role in ('admin', 'member')),
  constraint ck_users_status check (status in ('active', 'suspended')),
  constraint ck_users_permissions_object check (jsonb_typeof(permissions) = 'object')
);

create unique index uq_users_tenant_id_id on users (tenant_id, id);
create unique index uq_users_tenant_email on users (tenant_id, lower(email));
create index idx_users_tenant_status on users (tenant_id, status);

create trigger trg_users_updated_at
before update on users
for each row execute function set_updated_at();

create table customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  external_customer_code text,
  name text not null,
  name_kana text,
  postal_code text,
  address text,
  phone text,
  email text,
  contact_name text,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create unique index uq_customers_tenant_id_id on customers (tenant_id, id);
create unique index uq_customers_tenant_external_code
  on customers (tenant_id, external_customer_code)
  where external_customer_code is not null;
create index idx_customers_tenant_name on customers (tenant_id, name);
create index idx_customers_tenant_active on customers (tenant_id, deleted_at);

create trigger trg_customers_updated_at
before update on customers
for each row execute function set_updated_at();

create table price_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  external_item_code text,
  name text not null,
  unit text not null,
  unit_price numeric(14,2) not null,
  tax_category text not null default 'taxable',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint ck_price_items_unit_price_non_negative check (unit_price >= 0),
  constraint ck_price_items_tax_category check (tax_category in ('taxable', 'non_taxable', 'tax_exempt'))
);

create unique index uq_price_items_tenant_id_id on price_items (tenant_id, id);
create unique index uq_price_items_tenant_external_code
  on price_items (tenant_id, external_item_code)
  where external_item_code is not null;
create index idx_price_items_tenant_name on price_items (tenant_id, name);
create index idx_price_items_tenant_name_unit on price_items (tenant_id, name, unit);
create index idx_price_items_tenant_active on price_items (tenant_id, is_active, deleted_at);

create trigger trg_price_items_updated_at
before update on price_items
for each row execute function set_updated_at();

create table estimates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  customer_id uuid not null,
  salesperson_id uuid,
  estimate_no text not null,
  title text not null,
  status text not null default 'draft',
  estimate_date date not null default current_date,
  expires_on date,
  subtotal numeric(14,2) not null default 0,
  tax_amount numeric(14,2) not null default 0,
  total_amount numeric(14,2) not null default 0,
  customer_note text,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint fk_estimates_customers
    foreign key (tenant_id, customer_id) references customers(tenant_id, id),
  constraint fk_estimates_salesperson
    foreign key (tenant_id, salesperson_id) references users(tenant_id, id),
  constraint ck_estimates_status check (status in ('draft', 'submitted', 'won', 'lost', 'cancelled')),
  constraint ck_estimates_amounts_non_negative check (
    subtotal >= 0 and tax_amount >= 0 and total_amount >= 0
  )
);

create unique index uq_estimates_tenant_id_id on estimates (tenant_id, id);
create unique index uq_estimates_tenant_estimate_no on estimates (tenant_id, estimate_no);
create index idx_estimates_tenant_customer on estimates (tenant_id, customer_id);
create index idx_estimates_tenant_status on estimates (tenant_id, status);
create index idx_estimates_tenant_date on estimates (tenant_id, estimate_date desc);

create trigger trg_estimates_updated_at
before update on estimates
for each row execute function set_updated_at();

create table estimate_lines (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  estimate_id uuid not null,
  price_item_id uuid,
  line_no integer not null,
  line_type text not null default 'normal',
  location text,
  item_name text not null,
  quantity numeric(12,3) not null default 0,
  unit text not null,
  unit_price numeric(14,2) not null default 0,
  amount numeric(14,2) generated always as (round(quantity * unit_price, 2)) stored,
  remarks text,
  vendor_instructions text,
  external_item_code text,
  external_line_code text,
  ai_confidence numeric(5,4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint fk_estimate_lines_estimates
    foreign key (tenant_id, estimate_id) references estimates(tenant_id, id) on delete cascade,
  constraint fk_estimate_lines_price_items
    foreign key (tenant_id, price_item_id) references price_items(tenant_id, id),
  constraint ck_estimate_lines_type check (line_type in ('normal', 'discount', 'expense', 'note')),
  constraint ck_estimate_lines_quantity_non_negative check (quantity >= 0),
  constraint ck_estimate_lines_unit_price_non_negative check (unit_price >= 0),
  constraint ck_estimate_lines_ai_confidence check (ai_confidence is null or (ai_confidence >= 0 and ai_confidence <= 1))
);

create unique index uq_estimate_lines_tenant_estimate_line_no
  on estimate_lines (tenant_id, estimate_id, line_no)
  where deleted_at is null;
create index idx_estimate_lines_tenant_estimate on estimate_lines (tenant_id, estimate_id, line_no);
create index idx_estimate_lines_tenant_price_item on estimate_lines (tenant_id, price_item_id);
create index idx_estimate_lines_tenant_external_line on estimate_lines (tenant_id, external_line_code);

create trigger trg_estimate_lines_updated_at
before update on estimate_lines
for each row execute function set_updated_at();

create table files (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  kind text not null,
  storage_provider text not null default 'vercel_blob',
  object_key text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_by_user_id uuid,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint fk_files_created_by
    foreign key (tenant_id, created_by_user_id) references users(tenant_id, id),
  constraint uq_files_object_key unique (storage_provider, object_key),
  constraint ck_files_kind check (kind in ('audio', 'meeting_audio', 'logo', 'import_excel', 'estimate_excel', 'estimate_pdf', 'integration_csv')),
  constraint ck_files_size_non_negative check (size_bytes is null or size_bytes >= 0)
);

create unique index uq_files_tenant_id_id on files (tenant_id, id);
create index idx_files_tenant_kind on files (tenant_id, kind);
create index idx_files_tenant_created_at on files (tenant_id, created_at desc);

create table ai_analysis_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  estimate_id uuid,
  input_type text not null,
  status text not null default 'queued',
  input_file_id uuid,
  transcript text,
  result_json jsonb not null default '{}'::jsonb,
  error_message text,
  created_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_ai_analysis_runs_estimates
    foreign key (tenant_id, estimate_id) references estimates(tenant_id, id),
  constraint fk_ai_analysis_runs_files
    foreign key (tenant_id, input_file_id) references files(tenant_id, id),
  constraint fk_ai_analysis_runs_created_by
    foreign key (tenant_id, created_by_user_id) references users(tenant_id, id),
  constraint ck_ai_analysis_runs_input_type check (input_type in ('audio', 'text')),
  constraint ck_ai_analysis_runs_status check (status in ('queued', 'processing', 'completed', 'failed', 'confirmed')),
  constraint ck_ai_analysis_runs_result_object check (jsonb_typeof(result_json) = 'object')
);

create index idx_ai_analysis_runs_tenant_estimate on ai_analysis_runs (tenant_id, estimate_id);
create index idx_ai_analysis_runs_tenant_status on ai_analysis_runs (tenant_id, status);

create trigger trg_ai_analysis_runs_updated_at
before update on ai_analysis_runs
for each row execute function set_updated_at();

create table import_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  job_type text not null default 'price_items_excel',
  status text not null default 'uploaded',
  source_file_id uuid,
  mapping_json jsonb not null default '{}'::jsonb,
  result_json jsonb not null default '{}'::jsonb,
  error_message text,
  created_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_import_jobs_files
    foreign key (tenant_id, source_file_id) references files(tenant_id, id),
  constraint fk_import_jobs_created_by
    foreign key (tenant_id, created_by_user_id) references users(tenant_id, id),
  constraint ck_import_jobs_type check (job_type in ('price_items_excel')),
  constraint ck_import_jobs_status check (status in ('uploaded', 'mapped', 'validated', 'imported', 'failed')),
  constraint ck_import_jobs_mapping_object check (jsonb_typeof(mapping_json) = 'object'),
  constraint ck_import_jobs_result_object check (jsonb_typeof(result_json) = 'object')
);

create index idx_import_jobs_tenant_status on import_jobs (tenant_id, status);

create trigger trg_import_jobs_updated_at
before update on import_jobs
for each row execute function set_updated_at();

create table export_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id),
  estimate_id uuid not null,
  export_type text not null,
  export_mode text not null,
  status text not null default 'queued',
  output_file_id uuid,
  result_json jsonb not null default '{}'::jsonb,
  error_message text,
  created_by_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fk_export_jobs_estimates
    foreign key (tenant_id, estimate_id) references estimates(tenant_id, id),
  constraint fk_export_jobs_files
    foreign key (tenant_id, output_file_id) references files(tenant_id, id),
  constraint fk_export_jobs_created_by
    foreign key (tenant_id, created_by_user_id) references users(tenant_id, id),
  constraint ck_export_jobs_type check (export_type in ('excel', 'pdf', 'csv')),
  constraint ck_export_jobs_mode check (export_mode in ('customer', 'internal', 'integration')),
  constraint ck_export_jobs_status check (status in ('queued', 'processing', 'completed', 'failed')),
  constraint ck_export_jobs_result_object check (jsonb_typeof(result_json) = 'object')
);

create index idx_export_jobs_tenant_estimate on export_jobs (tenant_id, estimate_id);
create index idx_export_jobs_tenant_status on export_jobs (tenant_id, status);

create trigger trg_export_jobs_updated_at
before update on export_jobs
for each row execute function set_updated_at();

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  user_id uuid,
  action text not null,
  target_table text,
  target_id uuid,
  result text not null default 'success',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint fk_audit_logs_users
    foreign key (tenant_id, user_id) references users(tenant_id, id),
  constraint ck_audit_logs_result check (result in ('success', 'failure')),
  constraint ck_audit_logs_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index idx_audit_logs_tenant_created_at on audit_logs (tenant_id, created_at desc);
create index idx_audit_logs_target on audit_logs (target_table, target_id);
