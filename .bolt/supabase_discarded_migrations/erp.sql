-- Enums para status e tipos do ERP
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'erp_work_order_status') THEN
        CREATE TYPE erp_work_order_status AS ENUM ('open', 'in_progress', 'finished', 'canceled', 'delivered');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'erp_account_status') THEN
        CREATE TYPE erp_account_status AS ENUM ('pending', 'paid', 'overdue', 'canceled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'erp_stock_movement_type') THEN
        CREATE TYPE erp_stock_movement_type AS ENUM ('in', 'out', 'adjust');
    END IF;
END$$;

-- Clientes da oficina
CREATE TABLE IF NOT EXISTS erp_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    document_type TEXT,
    document_number TEXT,
    address JSONB,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

-- Veículos dos clientes
CREATE TABLE IF NOT EXISTS erp_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES erp_customers(id) ON DELETE CASCADE,
    plate TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    year INTEGER,
    color TEXT,
    vin TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

-- Serviços cadastrados (catálogo de serviços)
CREATE TABLE IF NOT EXISTS erp_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    estimated_time_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

-- Produtos/Peças (catálogo e estoque)
CREATE TABLE IF NOT EXISTS erp_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    unit TEXT DEFAULT 'un',
    price NUMERIC NOT NULL,
    cost NUMERIC,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

-- Ordem de Serviço (OS)
CREATE TABLE IF NOT EXISTS erp_work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES erp_customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES erp_vehicles(id) ON DELETE SET NULL,
    status erp_work_order_status NOT NULL DEFAULT 'open',
    entry_date TIMESTAMP DEFAULT now(),
    exit_date TIMESTAMP,
    total NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

-- Serviços realizados na OS
CREATE TABLE IF NOT EXISTS erp_work_order_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES erp_work_orders(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES erp_services(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT
);

-- Produtos/Peças utilizados na OS
CREATE TABLE IF NOT EXISTS erp_work_order_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_order_id UUID NOT NULL REFERENCES erp_work_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES erp_products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT
);

-- Vendas diretas (balcão)
CREATE TABLE IF NOT EXISTS erp_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES erp_customers(id) ON DELETE SET NULL,
    total NUMERIC NOT NULL,
    discount NUMERIC DEFAULT 0,
    sale_date TIMESTAMP DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT,
    deleted_at TIMESTAMP,
    deleted_by TEXT
);

-- Produtos vendidos na venda direta
CREATE TABLE IF NOT EXISTS erp_sale_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES erp_sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES erp_products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT
);

-- Contas a receber (financeiro)
CREATE TABLE IF NOT EXISTS erp_accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES erp_customers(id) ON DELETE SET NULL,
    work_order_id UUID REFERENCES erp_work_orders(id) ON DELETE SET NULL,
    sale_id UUID REFERENCES erp_sales(id) ON DELETE SET NULL,
    due_date TIMESTAMP NOT NULL,
    amount NUMERIC NOT NULL,
    received_amount NUMERIC DEFAULT 0,
    status erp_account_status NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT
);

-- Contas a pagar (financeiro)
CREATE TABLE IF NOT EXISTS erp_accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    supplier_name TEXT,
    due_date TIMESTAMP NOT NULL,
    amount NUMERIC NOT NULL,
    paid_amount NUMERIC DEFAULT 0,
    status erp_account_status NOT NULL DEFAULT 'pending',
    payment_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT,
    updated_at TIMESTAMP DEFAULT now(),
    updated_by TEXT
);

-- Movimentação de estoque (entrada/saída)
CREATE TABLE IF NOT EXISTS erp_stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES erp_products(id) ON DELETE CASCADE,
    type erp_stock_movement_type NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost NUMERIC,
    movement_date TIMESTAMP DEFAULT now(),
    related_work_order_id UUID REFERENCES erp_work_orders(id) ON DELETE SET NULL,
    related_sale_id UUID REFERENCES erp_sales(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT now(),
    created_by TEXT
);
