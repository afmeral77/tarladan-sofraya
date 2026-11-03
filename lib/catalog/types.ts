import type { Tables } from "@/lib/supabase/database.types";

export type ProductUnit = Tables<"products">["unit"];
export type ProductStatus = Tables<"products">["status"];
export type ProductCategory = Tables<"product_categories">;
export type ProductRecord = Tables<"products">;
export type InventoryRecord = Tables<"inventory">;
export type HarvestRecord = Tables<"harvests">;

export type ProducerPublicProfile = Pick<
  Tables<"producers">,
  "user_id" | "public_name" | "bio" | "region" | "city" | "verification_status" | "is_public"
>;

export type CatalogProduct = ProductRecord & {
  category: Pick<ProductCategory, "id" | "name" | "slug"> | null;
  producer: ProducerPublicProfile | null;
  inventory: Pick<InventoryRecord, "available_quantity" | "estimated_quantity" | "updated_at"> | null;
  harvest: Pick<HarvestRecord, "harvest_date" | "estimated_quantity" | "unit" | "notes"> | null;
};

export type CatalogSort = "newest" | "price_asc" | "price_desc";

export type CatalogFilters = {
  query: string;
  category: string;
  region: string;
  minPrice: number | null;
  maxPrice: number | null;
  minQuantity: number | null;
  harvestFrom: string;
  harvestTo: string;
  qualityGrade: string;
  sort: CatalogSort;
  page: number;
};

export type CatalogPageData = {
  categories: ProductCategory[];
  filters: CatalogFilters;
  products: CatalogProduct[];
  totalCount: number;
  error: boolean;
};
