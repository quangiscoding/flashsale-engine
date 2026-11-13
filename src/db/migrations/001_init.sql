CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  sku VARCHAR(32) NOT NULL UNIQUE,           -- Human-readable slug (e.g., 'prod_999')
  name VARCHAR(100) NOT NULL,
  stock INT NOT NULL CHECK (stock >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuidv7(),
  order_number VARCHAR(24) NOT NULL UNIQUE,  -- Customer-facing receipt ID (e.g., 'ORD-2611-8X92K')
  user_id VARCHAR(50) NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders(product_id);