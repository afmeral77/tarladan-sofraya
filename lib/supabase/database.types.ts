// Generated from Supabase project dmfcruizfwiuneilckji; kept in sync with SQL migrations.
// Regenerate after each schema migration with the Supabase MCP type generator.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Table<Row, Insert, Update, Relations extends Relationship[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relations;
};

type ProfileRole = "producer" | "buyer" | "carrier" | "admin";
type BusinessKind = "producer" | "buyer" | "carrier";
type VerificationStatus = "pending" | "approved" | "rejected";
type ProductStatus = "draft" | "active" | "paused" | "archived";
type ProductUnit = "kg" | "ton" | "crate" | "piece";

type ProfileRow = {
  id: string;
  role: ProfileRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};
type BusinessRow = {
  id: string;
  owner_id: string;
  kind: BusinessKind;
  legal_name: string;
  display_name: string;
  tax_office: string | null;
  tax_number: string | null;
  phone: string | null;
  email: string | null;
  country_code: string;
  city: string | null;
  district: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};
type ProducerRow = {
  user_id: string;
  business_id: string | null;
  public_name: string;
  bio: string | null;
  region: string | null;
  city: string | null;
  verification_status: VerificationStatus;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};
type ProductRow = {
  id: string;
  producer_user_id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  quality_grade: string | null;
  price_per_unit: number;
  currency_code: string;
  unit: ProductUnit;
  minimum_order_qty: number;
  origin_city: string | null;
  origin_region: string | null;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
};

type OwnerProfileRelationship = [{
  foreignKeyName: "businesses_owner_id_fkey";
  columns: ["owner_id"];
  isOneToOne: false;
  referencedRelation: "profiles";
  referencedColumns: ["id"];
}];
type BusinessRelationship = [{
  foreignKeyName: "buyers_business_id_fkey" | "carriers_business_id_fkey";
  columns: ["business_id"];
  isOneToOne: false;
  referencedRelation: "businesses";
  referencedColumns: ["id"];
}];

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        ProfileRow,
        Pick<ProfileRow, "id"> & Partial<Omit<ProfileRow, "id">>,
        Partial<Pick<ProfileRow, "full_name" | "phone" | "avatar_url" | "updated_at">>
      >;
      businesses: Table<
        BusinessRow,
        Pick<BusinessRow, "owner_id" | "kind" | "legal_name" | "display_name"> &
          Partial<Omit<BusinessRow, "owner_id" | "kind" | "legal_name" | "display_name">>,
        Partial<BusinessRow>,
        OwnerProfileRelationship
      >;
      producers: Table<
        ProducerRow,
        Pick<ProducerRow, "user_id" | "public_name"> & {
          business_id?: string | null;
          bio?: string | null;
          region?: string | null;
          city?: string | null;
        },
        Partial<Pick<ProducerRow, "business_id" | "public_name" | "bio" | "region" | "city" | "updated_at">>,
        [
          {
            foreignKeyName: "producers_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "producers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      buyers: Table<
        { user_id: string; business_id: string; created_at: string; updated_at: string },
        { user_id: string; business_id: string; created_at?: string; updated_at?: string },
        Partial<{ user_id: string; business_id: string; created_at: string; updated_at: string }>,
        [
          {
            foreignKeyName: "buyers_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "buyers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      carriers: Table<
        {
          user_id: string;
          business_id: string;
          vehicle_type: string | null;
          capacity_kg: number | null;
          service_regions: string[];
          created_at: string;
          updated_at: string;
        },
        {
          user_id: string;
          business_id: string;
          vehicle_type?: string | null;
          capacity_kg?: number | null;
          service_regions?: string[];
          created_at?: string;
          updated_at?: string;
        },
        Partial<{
          user_id: string;
          business_id: string;
          vehicle_type: string | null;
          capacity_kg: number | null;
          service_regions: string[];
          created_at: string;
          updated_at: string;
        }>,
        [
          {
            foreignKeyName: "carriers_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "carriers_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ]
      >;
      product_categories: Table<
        {
          id: string;
          slug: string;
          name: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        },
        {
          id?: string;
          slug: string;
          name: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        },
        Partial<{
          id: string;
          slug: string;
          name: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        }>
      >;
      products: Table<
        ProductRow,
        Pick<ProductRow, "producer_user_id" | "category_id" | "name" | "slug" | "price_per_unit" | "unit"> &
          Partial<Omit<ProductRow, "producer_user_id" | "category_id" | "name" | "slug" | "price_per_unit" | "unit">>,
        Partial<ProductRow>,
        [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_producer_user_id_fkey";
            columns: ["producer_user_id"];
            isOneToOne: false;
            referencedRelation: "producers";
            referencedColumns: ["user_id"];
          },
        ]
      >;
      inventory: Table<
        { product_id: string; available_quantity: number; estimated_quantity: number | null; updated_at: string },
        { product_id: string; available_quantity?: number; estimated_quantity?: number | null; updated_at?: string },
        Partial<{ product_id: string; available_quantity: number; estimated_quantity: number | null; updated_at: string }>,
        [{
          foreignKeyName: "inventory_product_id_fkey";
          columns: ["product_id"];
          isOneToOne: true;
          referencedRelation: "products";
          referencedColumns: ["id"];
        }]
      >;
      harvests: Table<
        {
          id: string;
          product_id: string;
          harvest_date: string | null;
          estimated_quantity: number | null;
          unit: ProductUnit;
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          product_id: string;
          harvest_date?: string | null;
          estimated_quantity?: number | null;
          unit: ProductUnit;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        },
        Partial<{
          id: string;
          product_id: string;
          harvest_date: string | null;
          estimated_quantity: number | null;
          unit: ProductUnit;
          notes: string | null;
          created_at: string;
          updated_at: string;
        }>,
        [{
          foreignKeyName: "harvests_product_id_fkey";
          columns: ["product_id"];
          isOneToOne: false;
          referencedRelation: "products";
          referencedColumns: ["id"];
        }]
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      profile_role: ProfileRole;
      business_kind: BusinessKind;
      producer_verification_status: VerificationStatus;
      catalog_product_status: ProductStatus;
      product_unit: ProductUnit;
    };
    CompositeTypes: Record<string, never>;
  };
};
