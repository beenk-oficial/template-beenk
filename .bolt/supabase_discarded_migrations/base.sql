CREATE TYPE user_type AS ENUM ('admin', 'user', 'owner', 'guest');
CREATE TYPE company_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error');
CREATE TYPE auth_provider AS ENUM ('email', 'google');
CREATE TYPE subscription_owner_type AS ENUM ('user', 'company');
CREATE TYPE subscription_status AS ENUM (
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid'
);
CREATE TYPE referral_status AS ENUM ('pending', 'accepted', 'rewarded');
CREATE TYPE invoice_status AS ENUM (
    'draft',
    'open',
    'paid',
    'uncollectible',
    'void'
);
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');


CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    address_line TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'BR',

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    description TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS white_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    logo_url TEXT,
    favicon_url TEXT,
    colors JSONB,

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    white_label_id UUID REFERENCES white_labels(id) ON DELETE SET NULL,
    address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    
    name TEXT NOT NULL,
    legal_name TEXT,
    identifier TEXT,
    identifier_type TEXT,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT UNIQUE,
    stripe_connect_id TEXT,
    commission_rate NUMERIC DEFAULT 0.10,
    timezone TEXT DEFAULT 'UTC',
    locale TEXT DEFAULT 'pt-BR',
    email TEXT,
    currency TEXT DEFAULT 'BRL',
    phone TEXT,

    bank_name TEXT,
    bank_account TEXT,
    bank_agency TEXT,
    pix_key TEXT,
    
    industry TEXT,
    status company_status DEFAULT 'inactive',

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);


CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    address_id UUID REFERENCES addresses(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    locale TEXT DEFAULT 'pt-BR',
    birth_date DATE,
    gender TEXT,
    nationality TEXT,
    document_type TEXT,
    document_number TEXT,
    show_onboarding BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    phone TEXT,
    type user_type NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT FALSE,
    UNIQUE (email, company_id),

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'info',
    action_url TEXT,
    read_at TIMESTAMP,
    sent_at TIMESTAMP DEFAULT now(),
    expires_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    description TEXT NOT NULL,
    
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS permission_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE (permission_id, role_id),

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS authentications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider auth_provider DEFAULT 'email',
    provider_id TEXT,
    email TEXT NOT NULL,
    password_hash TEXT,
    last_login TIMESTAMP,
    access_token TEXT DEFAULT NULL,
    access_token_expires_at TIMESTAMP DEFAULT NULL,
    refresh_token TEXT DEFAULT NULL,
    refresh_token_expires_at TIMESTAMP DEFAULT NULL,
    reset_token TEXT DEFAULT NULL,
    expires_reset_token_at TIMESTAMP DEFAULT NULL,

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    auth_id UUID NOT NULL REFERENCES authentications(id) ON DELETE CASCADE,
    event TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    origin TEXT,
    metadata JSONB,

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    owner_type subscription_owner_type NOT NULL,

    stripe_subscription_id TEXT NOT NULL,
    stripe_customer_id TEXT,
    plan_id UUID NOT NULL, 
    status subscription_status NOT NULL,
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);


CREATE TABLE IF NOT EXISTS subscription_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),


    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    event TEXT NOT NULL, 
    message TEXT,        
    metadata JSONB, 

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    stripe_invoice_id TEXT UNIQUE,
    invoice_pdf_url TEXT,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'BRL',
    status invoice_status NOT NULL DEFAULT 'draft',
    due_date TIMESTAMP,
    paid_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,         
    referral_code TEXT NOT NULL,                                          
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, 
    status referral_status DEFAULT 'pending',
    rewarded_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,
    description TEXT,
    features JSONB, 
    limits JSONB, 

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,

    name TEXT NOT NULL,
    stripe_price_id TEXT UNIQUE NOT NULL,

    monthly_price NUMERIC NOT NULL,
    duration_months INTEGER NOT NULL, 
    discount_percent NUMERIC,      
    original_price NUMERIC,              
    discount_price NUMERIC,      

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS promo_code (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    code TEXT UNIQUE NOT NULL,                         
    description TEXT,

    discount_type discount_type NOT NULL,              
    discount_value NUMERIC NOT NULL,                  

    usage_limit INT DEFAULT 1,                        
    total_usage_limit INT DEFAULT 1000,               

    expires_at TIMESTAMP,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS promo_code_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    promo_code_id UUID REFERENCES promo_code(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    used_at TIMESTAMP DEFAULT now(),

    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

CREATE TABLE IF NOT EXISTS payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL,                     -- ID do pagador na Stripe
    amount_total NUMERIC NOT NULL,                 -- valor bruto pago
    platform_fee NUMERIC NOT NULL,                 -- comissão da plataforma
    amount_received NUMERIC NOT NULL,              -- valor líquido para o seller
    status payment_status DEFAULT 'pending',
    stripe_payment_id TEXT NOT NULL,               -- PaymentIntent ou Checkout ID

    created_at TIMESTAMP DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP,
    deleted_by UUID
);

CREATE TABLE IF NOT EXISTS payout (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    payment_id UUID NOT NULL REFERENCES payment(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,                       -- valor transferido
    status payment_status DEFAULT 'pending',       -- mesmo ENUM: pending, paid, failed
    stripe_transfer_id TEXT,                       -- ID da transferência na Stripe

    created_at TIMESTAMP DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by UUID,
    deleted_at TIMESTAMP,
    deleted_by UUID
);

