
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create mikrotik_config table
CREATE TABLE IF NOT EXISTS public.mikrotik_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR NOT NULL,
  port VARCHAR NOT NULL,
  username VARCHAR NOT NULL,
  password VARCHAR NOT NULL,
  use_https BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wireguard_defaults table
CREATE TABLE IF NOT EXISTS public.wireguard_defaults (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint VARCHAR,
  port VARCHAR,
  dns VARCHAR,
  allowed_ip_range VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
