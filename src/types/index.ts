export enum UserType {
  ADMIN = "admin",
  USER = "user",
  OWNER = "owner",
  GUEST = "guest",
}

export enum CompanyStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

export enum NotificationType {
  INFO = "info",
  WARNING = "warning",
  SUCCESS = "success",
  ERROR = "error",
}

export enum AuthProvider {
  EMAIL = "email",
  GOOGLE = "google",
}

export enum SubscriptionOwnerType {
  USER = "user",
  COMPANY = "company",
}

export enum SubscriptionStatus {
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
  TRIALING = "trialing",
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  UNPAID = "unpaid",
}

export enum ReferralStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REWARDED = "rewarded",
}

export enum InvoiceStatus {
  DRAFT = "draft",
  OPEN = "open",
  PAID = "paid",
  UNCOLLECTIBLE = "uncollectible",
  VOID = "void",
}

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
}

export type Company = {
  id: string;
  white_label_id?: string;
  address_id?: string;
  name: string;
  legal_name?: string;
  identifier?: string;
  identifier_type?: string;
  slug: string;
  domain?: string;
  stripe_connect_id?: string;
  commission_rate?: number;
  timezone?: string;
  locale?: string;
  email?: string;
  currency?: string;
  phone?: string;
  bank_name?: string;
  bank_account?: string;
  bank_agency?: string;
  pix_key?: string;
  industry?: string;
  status?: CompanyStatus;
} & Timestamps;

export type User = {
  id: string;
  address_id?: string;
  email: string;
  full_name?: string;
  locale?: string;
  birth_date?: string;
  gender?: string;
  nationality?: string;
  document_type?: string;
  document_number?: string;
  show_onboarding?: boolean;
  avatar_url?: string;
  is_banned?: boolean;
  is_active?: boolean;
  type: UserType;
  company_id?: string;
} & Timestamps;

export type Timestamps = {
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  deleted_at?: string;
  deleted_by?: string;
};

export type Address = {
  id: string;
  address_line?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
} & Timestamps;

export type Role = {
  id: string;
  name: string;
  description: string;
} & Timestamps;

export type WhiteLabel = {
  id: string;
  logo_path?: string;
  favicon_path?: string;
  banner_login_path?: string;
  banner_signup_path?: string;
  banner_change_password_path?: string;
  banner_request_password_reset_path?: string;
  colors: Partial<WhitelabelColors>;
} & Timestamps;

export type Notification = {
  id: string;
  user_id?: string;
  company_id?: string;
  title: string;
  message: string;
  type?: NotificationType;
  action_url?: string;
  read_at?: string;
  sent_at?: string;
  expires_at?: string;
} & Timestamps;

export type Permission = {
  id: string;
  name: string;
  description: string;
} & Timestamps;

export type PermissionRole = {
  id: string;
  permission_id: string;
  role_id: string;
} & Timestamps;

export type Authentication = {
  id: string;
  user_id: string;
  provider?: AuthProvider;
  provider_id?: string;
  email: string;
  password_hash?: string;
  last_login?: string;
  access_token?: string;
  access_token_expires_at?: string;
  refresh_token?: string;
  refresh_token_expires_at?: string;
  reset_token?: string;
  expires_reset_token_at?: string;
} & Timestamps;

export type AuditLog = {
  id: string;
  auth_id: string;
  event: string;
  ip_address?: string;
  user_agent?: string;
  origin?: string;
  metadata?: Record<string, any>;
} & Timestamps;

export type Subscription = {
  id: string;
  user_id?: string;
  company_id?: string;
  owner_type: SubscriptionOwnerType;
  stripe_subscription_id: string;
  stripe_customer_id?: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  canceled_at?: string;
  trial_start?: string;
  trial_end?: string;
} & Timestamps;

export type SubscriptionLog = {
  id: string;
  subscription_id: string;
  company_id?: string;
  user_id?: string;
  event: string;
  message?: string;
  metadata?: Record<string, any>;
} & Timestamps;

export type Invoice = {
  id: string;
  subscription_id?: string;
  company_id?: string;
  user_id?: string;
  stripe_invoice_id?: string;
  invoice_pdf_url?: string;
  amount: number;
  currency?: string;
  status: InvoiceStatus;
  due_date?: string;
  paid_at?: string;
} & Timestamps;

export type Referral = {
  id: string;
  referrer_user_id: string;
  referred_user_id?: string;
  referral_code: string;
  company_id: string;
  status?: ReferralStatus;
  rewarded_at?: string;
} & Timestamps;

export type License = {
  id: string;
  name: string;
  description?: string;
  features?: Record<string, any>;
  limits?: Record<string, any>;
} & Timestamps;

export type Plan = {
  id: string;
  license_id: string;
  name: string;
  stripe_price_id: string;
  monthly_price: number;
  duration_months: number;
  discount_percent?: number;
  original_price?: number;
  discount_price?: number;
  is_active?: boolean;
} & Timestamps;

export type PromoCode = {
  id: string;
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  usage_limit?: number;
  total_usage_limit?: number;
  expires_at?: string;
  company_id?: string;
} & Timestamps;

export type PromoCodeUsage = {
  id: string;
  promo_code_id: string;
  user_id: string;
  company_id: string;
  used_at?: string;
} & Timestamps;

export type Payment = {
  id: string;
  company_id: string;
  customer_id: string;
  amount_total: number;
  platform_fee: number;
  amount_received: number;
  status: PaymentStatus;
  stripe_payment_id: string;
} & Timestamps;

export type Payout = {
  id: string;
  company_id: string;
  payment_id: string;
  amount: number;
  status: PaymentStatus;
  stripe_transfer_id?: string;
} & Timestamps;

export interface ICommon {
  [key: string]: any;
}

export interface IColumns<T = any> {
  label: string;
  field: string;
  sortable?: boolean;

  align?: "left" | "center" | "right";
  sort?: (a: any, b: any, rowA: T, rowB: T) => any;
  format?: (val: any, row: T) => string;
  style?: string | ((row: T) => string | any[] | ICommon);
  classes?: string | ((row: T) => string);
  headerStyle?: string;
  headerClasses?: string;
  colSpan?: number;

  component?: React.ComponentType<{ row: T }>;
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export interface IPagination {
  sortField: string;
  sortOrder: SortOrder;

  search?: string;

  currentPage: number;
  itemsPerPage: number;

  currentTotalItems: number;
  totalItems: number;
  totalPages: number;
}

export type WhitelabelColors = {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  sidebar: string;
  "sidebar-foreground": string;
  "sidebar-primary": string;
  "sidebar-primary-foreground": string;
  "sidebar-accent": string;
  "sidebar-accent-foreground": string;
  "sidebar-border": string;
  "sidebar-ring": string;
};