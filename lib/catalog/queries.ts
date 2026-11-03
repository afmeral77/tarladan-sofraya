import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import type { CatalogFilters, CatalogPageData, CatalogProduct, ProductCategory } from "@/lib/catalog/types";

const PAGE_SIZE = 18;
const PRODUCT_SELECT = `
  id, producer_user_id, category_id, name, slug, description, quality_grade,
  price_per_unit, currency_code, unit, minimum_order_qty, origin_city, origin_region,
  status, created_at, updated_at, image_path,
  category:product_categories!products_category_id_fkey(id,name,slug),
  producer:producers!products_producer_user_id_fkey(user_id,public_name,bio,region,city,verification_status,is_public),
  inventory:inventory!inventory_product_id_fkey(available_quantity,estimated_quantity,updated_at),
  harvests:harvests!harvests_product_id_fkey(harvest_date,estimated_quantity,unit,notes,created_at)
`;

type CategoryRelation = Pick<Tables<"product_categories">, "id" | "name" | "slug"> | null;
type ProducerRelation = Pick<
  Tables<"producers">,
  "user_id" | "public_name" | "bio" | "region" | "city" | "verification_status" | "is_public"
> | null;
type InventoryRelation = Pick<Tables<"inventory">, "available_quantity" | "estimated_quantity" | "updated_at">;
type HarvestRelation = Pick<
  Tables<"harvests">,
  "harvest_date" | "estimated_quantity" | "unit" | "notes" | "created_at"
>;
type CatalogQueryRow = Tables<"products"> & {
  category: CategoryRelation;
  producer: ProducerRelation;
  inventory: InventoryRelation | InventoryRelation[] | null;
  harvests: HarvestRelation[] | null;
};

const FALLBACK_FILTERS: CatalogFilters = {
  query: "",
  category: "",
  region: "",
  minPrice: null,
  maxPrice: null,
  minQuantity: null,
  harvestFrom: "",
  harvestTo: "",
  qualityGrade: "",
  sort: "newest",
  page: 1,
};

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value ?? "").trim();
}

function numericParam(value: string): number | null {
  if (!value || value.length > 16) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function validDateParam(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value ? "" : value;
}

export function parseCatalogFilters(params: Record<string, string | string[] | undefined>): CatalogFilters {
  const query = firstParam(params.q).replace(/[\\%_]/g, " ").slice(0, 100);
  const category = firstParam(params.kategori).slice(0, 60);
  const region = firstParam(params.bolge).slice(0, 80);
  const minPrice = numericParam(firstParam(params.fiyatMin));
  const maxPrice = numericParam(firstParam(params.fiyatMax));
  const minQuantity = numericParam(firstParam(params.stokMin));
  const harvestFrom = validDateParam(firstParam(params.hasatBaslangic));
  const harvestTo = validDateParam(firstParam(params.hasatBitis));
  const qualityGrade = firstParam(params.kalite).slice(0, 80);
  const rawSort = firstParam(params.sirala);
  const sort = rawSort === "price_asc" || rawSort === "price_desc" ? rawSort : "newest";
  const rawPage = Number(firstParam(params.sayfa));
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? Math.min(rawPage, 10000) : 1;

  return {
    ...FALLBACK_FILTERS,
    query,
    category,
    region,
    minPrice: minPrice !== null && maxPrice !== null && minPrice > maxPrice ? maxPrice : minPrice,
    maxPrice: minPrice !== null && maxPrice !== null && minPrice > maxPrice ? minPrice : maxPrice,
    minQuantity,
    harvestFrom,
    harvestTo,
    qualityGrade,
    sort,
    page,
  };
}

function one<T>(relation: T | T[] | null | undefined): T | null {
  if (Array.isArray(relation)) return relation[0] ?? null;
  return relation ?? null;
}

function mapProduct(row: CatalogQueryRow): CatalogProduct {
  const latestHarvest = [...(row.harvests ?? [])].sort((left, right) => {
    return (right.harvest_date ?? right.created_at).localeCompare(left.harvest_date ?? left.created_at);
  })[0];

  return {
    ...row,
    inventory: one(row.inventory),
    harvest: latestHarvest
      ? {
          harvest_date: latestHarvest.harvest_date,
          estimated_quantity: latestHarvest.estimated_quantity,
          unit: latestHarvest.unit,
          notes: latestHarvest.notes,
        }
      : null,
  };
}

async function loadProductRows(ids: string[]): Promise<CatalogProduct[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).in("id", ids);
  if (error || !data) return [];

  const rows = data as unknown as CatalogQueryRow[];
  const byId = new Map(rows.map((row) => [row.id, mapProduct(row)]));
  return ids.map((id) => byId.get(id)).filter((row): row is CatalogProduct => row !== undefined);
}

export async function getActiveCategories(): Promise<ProductCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("id,slug,name,sort_order,is_active,created_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  return error ? [] : data ?? [];
}

export async function getCatalogPage(filters: CatalogFilters): Promise<CatalogPageData> {
  const supabase = await createClient();
  const [categoryResult, searchResult] = await Promise.all([
    supabase
      .from("product_categories")
      .select("id,slug,name,sort_order,is_active,created_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase.rpc("search_catalog_products", {
      p_query: filters.query || undefined,
      p_category_slug: filters.category || undefined,
      p_region: filters.region || undefined,
      p_min_price: filters.minPrice ?? undefined,
      p_max_price: filters.maxPrice ?? undefined,
      p_min_quantity: filters.minQuantity ?? undefined,
      p_harvest_from: filters.harvestFrom || undefined,
      p_harvest_to: filters.harvestTo || undefined,
      p_quality_grade: filters.qualityGrade || undefined,
      p_sort: filters.sort,
      p_page: filters.page,
      p_page_size: PAGE_SIZE,
    }),
  ]);

  if (categoryResult.error || searchResult.error) {
    return {
      categories: categoryResult.data ?? [],
      filters,
      products: [],
      totalCount: 0,
      error: true,
    };
  }

  const ids = (searchResult.data ?? []).map((row) => row.product_id);
  const totalCount = searchResult.data?.[0]?.total_count ?? 0;
  const products = await loadProductRows(ids);

  return {
    categories: categoryResult.data ?? [],
    filters,
    products,
    totalCount,
    error: false,
  };
}

export async function getPublicProduct(id: string): Promise<CatalogProduct | null> {
  const rows = await loadProductRows([id]);
  return rows[0] ?? null;
}

export async function getPublicProducer(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("producers")
    .select("user_id,public_name,bio,region,city,verification_status,is_public")
    .eq("user_id", userId)
    .eq("is_public", true)
    .eq("verification_status", "approved")
    .maybeSingle();
  return error ? null : data;
}

export async function getPublicProducerProducts(userId: string): Promise<CatalogProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("producer_user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(60);
  if (error || !data) return [];
  return (data as unknown as CatalogQueryRow[]).map(mapProduct);
}

export async function getProducerProducts(userId: string): Promise<CatalogProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("producer_user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(100);
  if (error || !data) return [];
  return (data as unknown as CatalogQueryRow[]).map(mapProduct);
}

export async function getProducerProduct(userId: string, productId: string): Promise<CatalogProduct | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", productId)
    .eq("producer_user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapProduct(data as unknown as CatalogQueryRow);
}
