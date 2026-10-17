export type Panel = {
  id: string;
  slug: string;
  name: string;
  artist: string;
  description: string | null;
  category: string;
  badge: string | null;
  image_url: string;
  image_public_id: string | null;
  stock: number | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at?: string;
};

export type SizeRow = {
  size: string;
  sort_order: number;
  stock: number;
  is_active: boolean;
};

export type SizeChartRow = {
  size: string;
  chest: string;
  length: string;
  sleeve: string;
  fit: string;
};

export type StoreSettings = {
  jacket_price: number;
  jacket_compare_at: number | null;
  pack_price: number;
  pack_size: number;
  bundle_discount: number;
  custom_panel_fee: number;
  delivery_inside_dhaka: number;
  delivery_outside_dhaka: number;
  free_delivery_min: number | null;
  announcement: string | null;
  orders_enabled: boolean;
  support_phone: string | null;
  support_email: string | null;
  whatsapp: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  size_chart: SizeChartRow[];
};

export type Review = {
  id: string;
  name: string;
  location: string | null;
  rating: number;
  title: string | null;
  body: string;
  panel_name: string | null;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
};

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type DeliveryZone = "inside_dhaka" | "outside_dhaka";

/** A panel as it is stored inside a cart line / order item. */
export type PanelRef = {
  id?: string;
  slug: string;
  name: string;
  image: string;
  custom?: {
    url: string;
    publicId: string;
    zoom: number;
    x: number;
    y: number;
  };
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  item_type: "jacket" | "pack" | "bundle";
  title: string;
  size: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  panels: PanelRef[];
};

export type OrderRow = {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  phone: string;
  email: string | null;
  district: string;
  area: string | null;
  address: string;
  delivery_zone: DeliveryZone;
  note: string | null;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: "unpaid" | "paid" | "refunded";
  courier: string | null;
  tracking_code: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderEvent = {
  id: number;
  order_id: string;
  status: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
};
