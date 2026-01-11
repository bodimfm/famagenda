-- =============================================
-- SCHEMA COMPLETO DO SUPABASE - AGENDA FAMILIA
-- =============================================
-- Copie todo este conteúdo e cole no SQL Editor do Supabase

-- Tabela de grupos familiares
CREATE TABLE family_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de membros da familia
CREATE TABLE family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  avatar TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens de compras
CREATE TABLE shopping_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  added_by TEXT,
  category TEXT CHECK (category IN ('grocery', 'household', 'other')) DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de listas personalizadas
CREATE TABLE custom_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens das listas personalizadas
CREATE TABLE custom_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES custom_lists(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  added_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eventos do calendario
CREATE TABLE calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  description TEXT,
  type TEXT CHECK (type IN ('event', 'appointment', 'activity')) DEFAULT 'event',
  members_involved TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de datas importantes
CREATE TABLE important_dates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  recurring BOOLEAN DEFAULT FALSE,
  type TEXT CHECK (type IN ('birthday', 'anniversary', 'holiday', 'other')) DEFAULT 'other',
  member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pets
CREATE TABLE pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'other')) NOT NULL,
  breed TEXT,
  birth_date DATE,
  color TEXT NOT NULL,
  photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de vacinas dos pets
CREATE TABLE pet_vaccines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  next_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de banhos dos pets
CREATE TABLE pet_baths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transportes (quem busca/leva)
CREATE TABLE pickups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  family_group_id UUID REFERENCES family_groups(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL,
  responsible_member_id UUID REFERENCES family_members(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('pickup', 'dropoff')) NOT NULL,
  location TEXT NOT NULL,
  time TEXT NOT NULL,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6) NOT NULL,
  recurring BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE family_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_vaccines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_baths ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickups ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLITICAS DE ACESSO (para desenvolvimento)
-- =============================================

CREATE POLICY "Allow all" ON family_groups FOR ALL USING (true);
CREATE POLICY "Allow all" ON family_members FOR ALL USING (true);
CREATE POLICY "Allow all" ON shopping_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON custom_lists FOR ALL USING (true);
CREATE POLICY "Allow all" ON custom_list_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON calendar_events FOR ALL USING (true);
CREATE POLICY "Allow all" ON important_dates FOR ALL USING (true);
CREATE POLICY "Allow all" ON pets FOR ALL USING (true);
CREATE POLICY "Allow all" ON pet_vaccines FOR ALL USING (true);
CREATE POLICY "Allow all" ON pet_baths FOR ALL USING (true);
CREATE POLICY "Allow all" ON pickups FOR ALL USING (true);
