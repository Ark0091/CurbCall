-- CurbCall PostgreSQL schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users (drivers + admins)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  professional_type VARCHAR(50) NOT NULL CHECK (professional_type IN ('delivery', 'trades', 'taxi', 'medical', 'city_admin')),
  license_plate VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'driver' CHECK (role IN ('driver', 'admin')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Curb zones
CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  district VARCHAR(50) NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  max_duration_minutes INT NOT NULL DEFAULT 15,
  allowed_types TEXT[] NOT NULL DEFAULT ARRAY['delivery','trades','taxi','medical']::TEXT[],
  active_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Parking sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE RESTRICT,
  requested_duration_minutes INT NOT NULL CHECK (requested_duration_minutes IN (5,10,15,30)),
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMP,
  duration_minutes INT,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'flagged')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_zone_id ON sessions(zone_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
