
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
  port VARCHAR DEFAULT '51820',
  dns VARCHAR DEFAULT '1.1.1.1',
  allowed_ip_range VARCHAR DEFAULT '10.0.0.0/24',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_users table for authentication
CREATE TABLE IF NOT EXISTS public.system_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR NOT NULL UNIQUE,
  password_hash VARCHAR NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an update timestamp trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp trigger to mikrotik_config table
CREATE TRIGGER set_timestamp_mikrotik_config
BEFORE UPDATE ON public.mikrotik_config
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Apply timestamp trigger to wireguard_defaults table
CREATE TRIGGER set_timestamp_wireguard_defaults
BEFORE UPDATE ON public.wireguard_defaults
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Apply timestamp trigger to system_users table
CREATE TRIGGER set_timestamp_system_users
BEFORE UPDATE ON public.system_users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Insert default wireguard settings if none exist
INSERT INTO public.wireguard_defaults (endpoint, port, dns, allowed_ip_range)
SELECT '', '51820', '1.1.1.1', '10.0.0.0/24'
WHERE NOT EXISTS (SELECT 1 FROM public.wireguard_defaults);
