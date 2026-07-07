// Hand-written to match supabase/migrations/0001_init.sql. Once a live
// Supabase project exists, regenerate with:
//   supabase gen types typescript --project-id <id> > types/supabase.ts

export type TemplateCategory = "dogum" | "yildonumu" | "teklif" | "mezuniyet" | "anma";
export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "fulfilled" | "shipped";
export type ProductType = "digital" | "poster" | "framed_poster";

export interface Database {
  public: {
    Tables: {
      templates: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: TemplateCategory;
          description: string | null;
          default_message: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["templates"]["Row"]> & {
          slug: string;
          name: string;
          category: TemplateCategory;
        };
        Update: Partial<Database["public"]["Tables"]["templates"]["Row"]>;
        Relationships: [];
      };
      star_maps: {
        Row: {
          id: string;
          slug: string;
          user_id: string | null;
          template_id: string | null;
          title: string;
          message: string | null;
          event_date: string;
          timezone: string;
          latitude: number;
          longitude: number;
          location_name: string;
          music_url: string | null;
          screen_res_image_path: string | null;
          print_ready_path: string | null;
          is_public: boolean;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["star_maps"]["Row"]> & {
          slug: string;
          title: string;
          event_date: string;
          timezone: string;
          latitude: number;
          longitude: number;
          location_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["star_maps"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          star_map_id: string;
          customer_email: string;
          customer_name: string | null;
          product_type: ProductType;
          size: string | null;
          frame_option: string | null;
          price_amount: number;
          currency: string;
          status: OrderStatus;
          iyzico_payment_id: string | null;
          iyzico_conversation_id: string | null;
          shipping_address: Record<string, unknown> | null;
          tracking_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          star_map_id: string;
          customer_email: string;
          product_type: ProductType;
          price_amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
