import { computeTotals } from "@/lib/calc";
import { company, currentUser, customers, priceItems } from "@/lib/mock";
import type {
  Customer,
  Estimate,
  EstimateLine,
  EstimateStatus,
  LineType,
  PriceItem,
} from "@/lib/types";
import { getSql } from "./db";

const PLACEHOLDER_NO = "（保存時に自動採番）";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let bootstrapDone = false;
let bootstrapTenantId: string | null = null;
let bootstrapUserId: string | null = null;

export class ApiInputError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(message: string, status = 400, code = "VALIDATION_ERROR", details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type Sql = ReturnType<typeof getSql>;

type DbEstimateRow = {
  id: string;
  estimate_no: string;
  customer_code: string | null;
  title: string;
  status: EstimateStatus;
  estimate_date: string | Date;
  expires_on: string | Date | null;
  customer_note: string | null;
  internal_note: string | null;
  updated_at: string | Date;
  salesperson_name: string | null;
};

type DbLineRow = {
  id: string;
  price_item_code: string | null;
  line_no: number;
  line_type: LineType;
  location: string | null;
  item_name: string;
  quantity: string | number;
  unit: string;
  unit_price: string | number;
  remarks: string | null;
  vendor_instructions: string | null;
};

type DbCustomerRow = {
  id: string;
  external_customer_code: string | null;
  name: string;
  name_kana: string | null;
  postal_code: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  contact_name: string | null;
  memo: string | null;
};

type DbPriceItemRow = {
  id: string;
  external_item_code: string | null;
  name: string;
  unit: string;
  unit_price: string | number;
  is_active: boolean;
};

type DbImportJobRow = {
  id: string;
  job_type: string;
  status: string;
  mapping_json: unknown;
  result_json: unknown;
  error_message: string | null;
  created_at: string | Date;
};

type DbExportJobRow = {
  id: string;
  estimate_id: string;
  export_type: string;
  export_mode: string;
  status: string;
  result_json: unknown;
  error_message: string | null;
  created_at: string | Date;
};

export interface ImportJobRecord {
  id: string;
  jobType: string;
  status: string;
  mapping: unknown;
  result: unknown;
  errorMessage?: string;
  createdAt: string;
}

export interface ExportJobRecord {
  id: string;
  estimateId: string;
  exportType: string;
  exportMode: string;
  status: string;
  result: unknown;
  errorMessage?: string;
  createdAt: string;
}

function toIsoDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toIsoDateTime(value: string | Date | null | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === "number") return value;
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isUuid(value: string | null | undefined): value is string {
  return Boolean(value && UUID_RE.test(value));
}

function needsEstimateNo(estimate: Estimate): boolean {
  return !estimate.estimateNo || estimate.estimateNo === PLACEHOLDER_NO;
}

async function getOrCreateTenant(sql: Sql): Promise<string> {
  const envTenantId = process.env.MITSUMORI_TENANT_ID;
  if (isUuid(envTenantId)) return envTenantId;

  const existing = (await sql`
    select id from tenants
    where name = ${company.name}
    order by created_at asc
    limit 1
  `) as Array<{ id: string }>;
  if (existing[0]?.id) return existing[0].id;

  const inserted = (await sql`
    insert into tenants (name, plan_code, status)
    values (${company.name}, 'free', 'active')
    returning id
  `) as Array<{ id: string }>;
  return inserted[0].id;
}

async function ensureDemoUser(
  sql: Sql,
  tenantId: string,
): Promise<{ tenantId: string; userId: string }> {
  const rows = (await sql`
    insert into users (tenant_id, auth_provider, auth_subject, email, name, role, status)
    values (${tenantId}, 'demo', ${currentUser.id}, 'demo@voice-estimate.local', ${currentUser.name}, ${currentUser.role}, 'active')
    on conflict (auth_provider, auth_subject) do update
    set name = excluded.name,
        role = excluded.role,
        status = excluded.status
    returning id, tenant_id
  `) as Array<{ id: string; tenant_id: string }>;

  const row = rows[0];
  if (!row?.id || !row.tenant_id) {
    throw new Error("Demo user could not be initialized");
  }

  return { tenantId: row.tenant_id, userId: row.id };
}

async function ensureDemoCustomers(sql: Sql, tenantId: string) {
  for (const customer of customers) {
    await sql`
      insert into customers (
        tenant_id,
        external_customer_code,
        name,
        name_kana,
        postal_code,
        address,
        phone,
        email,
        contact_name,
        memo
      ) values (
        ${tenantId},
        ${customer.id},
        ${customer.name},
        ${customer.nameKana},
        ${customer.postalCode},
        ${customer.address},
        ${customer.phone},
        ${customer.email},
        ${customer.contactName},
        ${customer.note}
      )
      on conflict do nothing
    `;

    await sql`
      update customers
      set
        name = ${customer.name},
        name_kana = ${customer.nameKana},
        postal_code = ${customer.postalCode},
        address = ${customer.address},
        phone = ${customer.phone},
        email = ${customer.email},
        contact_name = ${customer.contactName},
        memo = ${customer.note},
        deleted_at = null
      where tenant_id = ${tenantId} and external_customer_code = ${customer.id}
    `;
  }
}

async function ensureDemoPriceItems(sql: Sql, tenantId: string) {
  for (const [index, item] of priceItems.entries()) {
    await sql`
      insert into price_items (
        tenant_id,
        external_item_code,
        name,
        unit,
        unit_price,
        is_active,
        sort_order
      ) values (
        ${tenantId},
        ${item.id},
        ${item.name},
        ${item.unit},
        ${item.unitPrice},
        ${item.isActive},
        ${index + 1}
      )
      on conflict do nothing
    `;

    await sql`
      update price_items
      set
        name = ${item.name},
        unit = ${item.unit},
        unit_price = ${item.unitPrice},
        is_active = ${item.isActive},
        sort_order = ${index + 1},
        deleted_at = null
      where tenant_id = ${tenantId} and external_item_code = ${item.id}
    `;
  }
}

async function ensureBootstrap(): Promise<{ tenantId: string; userId: string }> {
  const sql = getSql();
  if (bootstrapDone && bootstrapTenantId && bootstrapUserId) {
    return { tenantId: bootstrapTenantId, userId: bootstrapUserId };
  }

  const candidateTenantId = await getOrCreateTenant(sql);
  const demoUser = await ensureDemoUser(sql, candidateTenantId);
  const tenantId = demoUser.tenantId;
  const userId = demoUser.userId;
  await ensureDemoCustomers(sql, tenantId);
  await ensureDemoPriceItems(sql, tenantId);

  bootstrapTenantId = tenantId;
  bootstrapUserId = userId;
  bootstrapDone = true;
  return { tenantId, userId };
}

async function resolveCustomerId(sql: Sql, tenantId: string, customerCode?: string): Promise<string> {
  if (!customerCode) {
    throw new ApiInputError("顧客を選択してください。", 422);
  }

  if (isUuid(customerCode)) return customerCode;

  const rows = (await sql`
    select id from customers
    where tenant_id = ${tenantId}
      and external_customer_code = ${customerCode}
      and deleted_at is null
    limit 1
  `) as Array<{ id: string }>;

  if (!rows[0]?.id) {
    throw new ApiInputError("選択された顧客が見つかりません。", 404, "NOT_FOUND");
  }
  return rows[0].id;
}

async function resolvePriceItemId(
  sql: Sql,
  tenantId: string,
  priceItemCode?: string,
): Promise<string | null> {
  if (!priceItemCode) return null;
  if (isUuid(priceItemCode)) return priceItemCode;

  const rows = (await sql`
    select id from price_items
    where tenant_id = ${tenantId}
      and external_item_code = ${priceItemCode}
      and deleted_at is null
    limit 1
  `) as Array<{ id: string }>;

  return rows[0]?.id ?? null;
}

async function nextEstimateNo(sql: Sql, tenantId: string, now = new Date()): Promise<string> {
  const year = now.getFullYear();
  const prefix = `Q-${year}-`;
  const rows = (await sql`
    select estimate_no from estimates
    where tenant_id = ${tenantId} and estimate_no like ${`${prefix}%`}
  `) as Array<{ estimate_no: string }>;

  const max = rows.reduce((currentMax, row) => {
    const suffix = row.estimate_no.slice(prefix.length);
    const parsed = Number(suffix);
    return Number.isFinite(parsed) ? Math.max(currentMax, parsed) : currentMax;
  }, 0);

  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

function mapLine(row: DbLineRow): EstimateLine {
  return {
    id: row.id,
    lineNo: row.line_no,
    priceItemId: row.price_item_code ?? undefined,
    location: row.location ?? "",
    itemName: row.item_name,
    quantity: toNumber(row.quantity),
    unit: row.unit,
    unitPrice: toNumber(row.unit_price),
    customerNote: row.remarks ?? undefined,
    internalInstruction: row.vendor_instructions ?? undefined,
    lineType: row.line_type,
  };
}

function mapCustomer(row: DbCustomerRow): Customer {
  return {
    id: row.external_customer_code ?? row.id,
    name: row.name,
    nameKana: row.name_kana ?? "",
    postalCode: row.postal_code ?? "",
    address: row.address ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    contactName: row.contact_name ?? "",
    note: row.memo ?? "",
  };
}

function mapPriceItem(row: DbPriceItemRow): PriceItem {
  return {
    id: row.external_item_code ?? row.id,
    name: row.name,
    unit: row.unit,
    unitPrice: toNumber(row.unit_price),
    isActive: row.is_active,
  };
}

function mapImportJob(row: DbImportJobRow): ImportJobRecord {
  return {
    id: row.id,
    jobType: row.job_type,
    status: row.status,
    mapping: row.mapping_json,
    result: row.result_json,
    errorMessage: row.error_message ?? undefined,
    createdAt: toIsoDateTime(row.created_at),
  };
}

function mapExportJob(row: DbExportJobRow): ExportJobRecord {
  return {
    id: row.id,
    estimateId: row.estimate_id,
    exportType: row.export_type,
    exportMode: row.export_mode,
    status: row.status,
    result: row.result_json,
    errorMessage: row.error_message ?? undefined,
    createdAt: toIsoDateTime(row.created_at),
  };
}

function mapEstimate(row: DbEstimateRow, lines: EstimateLine[]): Estimate {
  return {
    id: row.id,
    estimateNo: row.estimate_no,
    customerId: row.customer_code ?? undefined,
    title: row.title,
    estimateDate: toIsoDate(row.estimate_date),
    expiresOn: toIsoDate(row.expires_on),
    status: row.status,
    assignee: row.salesperson_name ?? currentUser.name,
    lines,
    customerNote: row.customer_note ?? "",
    internalInstruction: row.internal_note ?? "",
    updatedAt: toIsoDateTime(row.updated_at),
  };
}

async function loadLines(sql: Sql, tenantId: string, estimateId: string): Promise<EstimateLine[]> {
  const rows = (await sql`
    select
      el.id,
      pi.external_item_code as price_item_code,
      el.line_no,
      el.line_type,
      el.location,
      el.item_name,
      el.quantity,
      el.unit,
      el.unit_price,
      el.remarks,
      el.vendor_instructions
    from estimate_lines el
    left join price_items pi
      on pi.tenant_id = el.tenant_id and pi.id = el.price_item_id
    where el.tenant_id = ${tenantId}
      and el.estimate_id = ${estimateId}
      and el.deleted_at is null
    order by el.line_no asc
  `) as DbLineRow[];

  return rows.map(mapLine);
}

async function loadEstimateById(sql: Sql, tenantId: string, id: string): Promise<Estimate | null> {
  const rows = (await sql`
    select
      e.id,
      e.estimate_no,
      c.external_customer_code as customer_code,
      e.title,
      e.status,
      e.estimate_date,
      e.expires_on,
      e.customer_note,
      e.internal_note,
      e.updated_at,
      u.name as salesperson_name
    from estimates e
    join customers c on c.tenant_id = e.tenant_id and c.id = e.customer_id
    left join users u on u.tenant_id = e.tenant_id and u.id = e.salesperson_id
    where e.tenant_id = ${tenantId}
      and e.id = ${id}
      and e.deleted_at is null
    limit 1
  `) as DbEstimateRow[];

  const row = rows[0];
  if (!row) return null;
  const lines = await loadLines(sql, tenantId, row.id);
  return mapEstimate(row, lines);
}

export async function listDbEstimates(): Promise<Estimate[]> {
  const sql = getSql();
  const { tenantId } = await ensureBootstrap();

  const rows = (await sql`
    select
      e.id,
      e.estimate_no,
      c.external_customer_code as customer_code,
      e.title,
      e.status,
      e.estimate_date,
      e.expires_on,
      e.customer_note,
      e.internal_note,
      e.updated_at,
      u.name as salesperson_name
    from estimates e
    join customers c on c.tenant_id = e.tenant_id and c.id = e.customer_id
    left join users u on u.tenant_id = e.tenant_id and u.id = e.salesperson_id
    where e.tenant_id = ${tenantId}
      and e.deleted_at is null
    order by e.updated_at desc
    limit 100
  `) as DbEstimateRow[];

  const estimates: Estimate[] = [];
  for (const row of rows) {
    estimates.push(mapEstimate(row, await loadLines(sql, tenantId, row.id)));
  }
  return estimates;
}

export async function listDbCustomers(): Promise<Customer[]> {
  const sql = getSql();
  const { tenantId } = await ensureBootstrap();

  const rows = (await sql`
    select
      id,
      external_customer_code,
      name,
      name_kana,
      postal_code,
      address,
      phone,
      email,
      contact_name,
      memo
    from customers
    where tenant_id = ${tenantId}
      and deleted_at is null
    order by name asc
  `) as DbCustomerRow[];

  return rows.map(mapCustomer);
}

export async function listDbPriceItems(): Promise<PriceItem[]> {
  const sql = getSql();
  const { tenantId } = await ensureBootstrap();

  const rows = (await sql`
    select
      id,
      external_item_code,
      name,
      unit,
      unit_price,
      is_active
    from price_items
    where tenant_id = ${tenantId}
      and deleted_at is null
    order by sort_order asc, name asc
  `) as DbPriceItemRow[];

  return rows.map(mapPriceItem);
}

export async function updateDbPriceItemActive(
  itemId: string,
  isActive: boolean,
): Promise<PriceItem> {
  const sql = getSql();
  const { tenantId } = await ensureBootstrap();

  const rows = isUuid(itemId)
    ? ((await sql`
        update price_items
        set is_active = ${isActive}, deleted_at = null
        where tenant_id = ${tenantId}
          and id = ${itemId}
        returning id, external_item_code, name, unit, unit_price, is_active
      `) as DbPriceItemRow[])
    : ((await sql`
        update price_items
        set is_active = ${isActive}, deleted_at = null
        where tenant_id = ${tenantId}
          and external_item_code = ${itemId}
        returning id, external_item_code, name, unit, unit_price, is_active
      `) as DbPriceItemRow[]);

  const row = rows[0];
  if (!row) {
    throw new ApiInputError("選択された単価マスターが見つかりません。", 404, "NOT_FOUND");
  }

  return mapPriceItem(row);
}

export async function listDbImportJobs(limit = 20): Promise<ImportJobRecord[]> {
  const sql = getSql();
  const { tenantId } = await ensureBootstrap();

  const rows = (await sql`
    select
      id,
      job_type,
      status,
      mapping_json,
      result_json,
      error_message,
      created_at
    from import_jobs
    where tenant_id = ${tenantId}
    order by created_at desc
    limit ${limit}
  `) as DbImportJobRow[];

  return rows.map(mapImportJob);
}

export async function recordDbImportJob(input: {
  status?: "uploaded" | "mapped" | "validated" | "imported" | "failed";
  mapping?: unknown;
  result?: unknown;
  errorMessage?: string;
}): Promise<ImportJobRecord> {
  const sql = getSql();
  const { tenantId, userId } = await ensureBootstrap();
  const status = input.status ?? "imported";
  const mappingJson = JSON.stringify(input.mapping ?? {});
  const resultJson = JSON.stringify(input.result ?? {});

  const rows = (await sql`
    insert into import_jobs (
      tenant_id,
      job_type,
      status,
      mapping_json,
      result_json,
      error_message,
      created_by_user_id
    ) values (
      ${tenantId},
      'price_items_excel',
      ${status},
      ${mappingJson}::jsonb,
      ${resultJson}::jsonb,
      ${input.errorMessage ?? null},
      ${userId}
    )
    returning id, job_type, status, mapping_json, result_json, error_message, created_at
  `) as DbImportJobRow[];

  return mapImportJob(rows[0]);
}

export async function listDbExportJobs(
  estimateId: string,
  limit = 20,
): Promise<ExportJobRecord[]> {
  if (!isUuid(estimateId)) return [];

  const sql = getSql();
  const { tenantId } = await ensureBootstrap();

  const rows = (await sql`
    select
      id,
      estimate_id,
      export_type,
      export_mode,
      status,
      result_json,
      error_message,
      created_at
    from export_jobs
    where tenant_id = ${tenantId}
      and estimate_id = ${estimateId}
    order by created_at desc
    limit ${limit}
  `) as DbExportJobRow[];

  return rows.map(mapExportJob);
}

export async function recordDbExportJob(input: {
  estimateId: string;
  exportType: "excel" | "pdf" | "csv";
  exportMode: "customer" | "internal" | "integration";
  status?: "queued" | "processing" | "completed" | "failed";
  result?: unknown;
  errorMessage?: string;
}): Promise<ExportJobRecord | null> {
  if (!isUuid(input.estimateId)) return null;

  const sql = getSql();
  const { tenantId, userId } = await ensureBootstrap();
  const resultJson = JSON.stringify(input.result ?? {});

  const rows = (await sql`
    insert into export_jobs (
      tenant_id,
      estimate_id,
      export_type,
      export_mode,
      status,
      result_json,
      error_message,
      created_by_user_id
    ) values (
      ${tenantId},
      ${input.estimateId},
      ${input.exportType},
      ${input.exportMode},
      ${input.status ?? "completed"},
      ${resultJson}::jsonb,
      ${input.errorMessage ?? null},
      ${userId}
    )
    returning id, estimate_id, export_type, export_mode, status, result_json, error_message, created_at
  `) as DbExportJobRow[];

  return mapExportJob(rows[0]);
}

function normalizeLineForDb(line: EstimateLine, index: number): EstimateLine {
  return {
    ...line,
    lineNo: index + 1,
    location: line.location ?? "",
    itemName: line.itemName || "（品目未入力）",
    quantity: Number.isFinite(Number(line.quantity)) ? Number(line.quantity) : 0,
    unit: line.unit || "式",
    unitPrice: Number.isFinite(Number(line.unitPrice)) ? Number(line.unitPrice) : 0,
    lineType: line.lineType || "normal",
  };
}

export async function saveDbEstimate(estimate: Estimate): Promise<Estimate> {
  const sql = getSql();
  const { tenantId, userId } = await ensureBootstrap();
  const customerId = await resolveCustomerId(sql, tenantId, estimate.customerId);
  const lines = estimate.lines.map(normalizeLineForDb);
  const totals = computeTotals(lines);
  const estimateNo = needsEstimateNo(estimate)
    ? await nextEstimateNo(sql, tenantId)
    : estimate.estimateNo;

  let estimateId: string;
  if (isUuid(estimate.id)) {
    const updated = (await sql`
      update estimates
      set
        customer_id = ${customerId},
        salesperson_id = ${userId},
        estimate_no = ${estimateNo},
        title = ${estimate.title || "無題の見積"},
        status = ${estimate.status},
        estimate_date = ${estimate.estimateDate},
        expires_on = ${estimate.expiresOn || null},
        subtotal = ${totals.subtotal},
        tax_amount = ${totals.tax},
        total_amount = ${totals.total},
        customer_note = ${estimate.customerNote ?? ""},
        internal_note = ${estimate.internalInstruction ?? ""},
        deleted_at = null
      where tenant_id = ${tenantId} and id = ${estimate.id}
      returning id
    `) as Array<{ id: string }>;

    if (updated[0]?.id) {
      estimateId = updated[0].id;
    } else {
      const inserted = (await sql`
        insert into estimates (
          tenant_id,
          customer_id,
          salesperson_id,
          estimate_no,
          title,
          status,
          estimate_date,
          expires_on,
          subtotal,
          tax_amount,
          total_amount,
          customer_note,
          internal_note
        ) values (
          ${tenantId},
          ${customerId},
          ${userId},
          ${estimateNo},
          ${estimate.title || "無題の見積"},
          ${estimate.status},
          ${estimate.estimateDate},
          ${estimate.expiresOn || null},
          ${totals.subtotal},
          ${totals.tax},
          ${totals.total},
          ${estimate.customerNote ?? ""},
          ${estimate.internalInstruction ?? ""}
        )
        returning id
      `) as Array<{ id: string }>;
      estimateId = inserted[0].id;
    }
  } else {
    const inserted = (await sql`
      insert into estimates (
        tenant_id,
        customer_id,
        salesperson_id,
        estimate_no,
        title,
        status,
        estimate_date,
        expires_on,
        subtotal,
        tax_amount,
        total_amount,
        customer_note,
        internal_note
      ) values (
        ${tenantId},
        ${customerId},
        ${userId},
        ${estimateNo},
        ${estimate.title || "無題の見積"},
        ${estimate.status},
        ${estimate.estimateDate},
        ${estimate.expiresOn || null},
        ${totals.subtotal},
        ${totals.tax},
        ${totals.total},
        ${estimate.customerNote ?? ""},
        ${estimate.internalInstruction ?? ""}
      )
      returning id
    `) as Array<{ id: string }>;
    estimateId = inserted[0].id;
  }

  await sql`
    delete from estimate_lines
    where tenant_id = ${tenantId} and estimate_id = ${estimateId}
  `;

  for (const line of lines) {
    const priceItemId = await resolvePriceItemId(sql, tenantId, line.priceItemId);
    await sql`
      insert into estimate_lines (
        tenant_id,
        estimate_id,
        price_item_id,
        line_no,
        line_type,
        location,
        item_name,
        quantity,
        unit,
        unit_price,
        remarks,
        vendor_instructions
      ) values (
        ${tenantId},
        ${estimateId},
        ${priceItemId},
        ${line.lineNo},
        ${line.lineType},
        ${line.location},
        ${line.itemName},
        ${line.quantity},
        ${line.unit},
        ${line.unitPrice},
        ${line.customerNote ?? null},
        ${line.internalInstruction ?? null}
      )
    `;
  }

  const saved = await loadEstimateById(sql, tenantId, estimateId);
  if (!saved) throw new Error("Saved estimate could not be loaded");
  return saved;
}
