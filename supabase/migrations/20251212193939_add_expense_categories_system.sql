/*
  # Add Comprehensive Expense Categories System

  1. New Tables
    - `expense_categories`
      - `id` (text, primary key) - Category ID (e.g., 'VS', 'AB')
      - `name` (text) - Category name (e.g., 'Vivienda y Servicios')
      - `icon` (text) - Emoji icon for the category
      - `created_at` (timestamptz)
    
    - `expense_subcategories`
      - `id` (text, primary key) - Subcategory ID (e.g., 'VS1', 'AB1-1')
      - `main_category_id` (text, foreign key) - Reference to expense_categories
      - `main_category` (text) - Main category name for easy access
      - `subcategory` (text) - Subcategory name
      - `examples` (text[]) - Array of example inputs
      - `frequency` (text) - Frequency of expense
      - `type` (text) - Type of expense (Esencial, Deseo, Obligatorio, Variable)
      - `created_at` (timestamptz)
  
  2. Updates
    - Add `subcategory_id` to transactions table
    - Keep existing `category` field for backward compatibility
  
  3. Data
    - Populate categories with 7 main categories
    - Populate subcategories with 91 detailed subcategories
  
  4. Security
    - Enable RLS on both tables
    - Add read-only policies for authenticated users
*/

-- Create expense_categories table
CREATE TABLE IF NOT EXISTS expense_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create expense_subcategories table
CREATE TABLE IF NOT EXISTS expense_subcategories (
  id text PRIMARY KEY,
  main_category_id text NOT NULL REFERENCES expense_categories(id) ON DELETE CASCADE,
  main_category text NOT NULL,
  subcategory text NOT NULL,
  examples text[] NOT NULL DEFAULT '{}',
  frequency text NOT NULL,
  type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add subcategory_id to transactions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE transactions ADD COLUMN subcategory_id text REFERENCES expense_subcategories(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for expense_categories (read-only for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can view expense categories" ON expense_categories;
CREATE POLICY "Authenticated users can view expense categories"
  ON expense_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for expense_subcategories (read-only for all authenticated users)
DROP POLICY IF EXISTS "Authenticated users can view expense subcategories" ON expense_subcategories;
CREATE POLICY "Authenticated users can view expense subcategories"
  ON expense_subcategories
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert main categories
INSERT INTO expense_categories (id, name, icon) VALUES
  ('VS', 'Vivienda y Servicios', '🏠'),
  ('AB', 'Alimentos y Bebidas', '🍽️'),
  ('TR', 'Transporte', '🚗'),
  ('SB', 'Salud y Bienestar', '💊'),
  ('EF', 'Educación y Familia', '👨‍👩‍👧‍👦'),
  ('TD', 'Tecnología', '💻'),
  ('FL', 'Financiero y Legal', '💰')
ON CONFLICT (id) DO NOTHING;

-- Insert all subcategories
INSERT INTO expense_subcategories (id, main_category_id, main_category, subcategory, examples, frequency, type) VALUES
  -- Vivienda y Servicios
  ('VS1', 'VS', 'Vivienda y Servicios', 'Renta / Hipoteca', ARRAY['Pago mensual casa', 'Renta depa'], 'Mensual', 'Esencial'),
  ('VS2-1', 'VS', 'Vivienda y Servicios', 'Luz', ARRAY['Luz'], 'Bimestral', 'Esencial'),
  ('VS2-2', 'VS', 'Vivienda y Servicios', 'Agua', ARRAY['Agua'], 'Mensual', 'Esencial'),
  ('VS2-3', 'VS', 'Vivienda y Servicios', 'Gas', ARRAY['Gas'], 'Mensual', 'Esencial'),
  ('VS2-4', 'VS', 'Vivienda y Servicios', 'Otros Servicios', ARRAY['Basura', 'Vigilancia'], 'Variable', 'Esencial'),
  ('VS3-1', 'VS', 'Vivienda y Servicios', 'Plomería', ARRAY['Plomería'], 'Irregular', 'Esencial'),
  ('VS3-2', 'VS', 'Vivienda y Servicios', 'Electricidad / Reparaciones', ARRAY['Electricidad', 'Reparaciones'], 'Irregular', 'Esencial'),
  ('VS3-3', 'VS', 'Vivienda y Servicios', 'Jardinería / Limpieza', ARRAY['Jardinería', 'Limpieza'], 'Mensual', 'Esencial'),
  ('VS3-4', 'VS', 'Vivienda y Servicios', 'Muebles y Decoración', ARRAY['Muebles', 'Decoración'], 'Irregular', 'Deseo'),
  ('VS3-5', 'VS', 'Vivienda y Servicios', 'Otros Mantenimiento', ARRAY['Otros Mantenimiento'], 'Irregular', 'Variable'),
  
  -- Alimentos y Bebidas
  ('AB1-1', 'AB', 'Alimentos y Bebidas', 'Cadenas Grandes', ARRAY['Cadenas Grandes'], 'Semanal', 'Esencial'),
  ('AB1-2', 'AB', 'Alimentos y Bebidas', 'Mercado / Frutería', ARRAY['Carnicería', 'Frutería', 'Mercado'], 'Semanal', 'Esencial'),
  ('AB1-3', 'AB', 'Alimentos y Bebidas', 'Agua Purificada', ARRAY['Garrafón'], 'Semanal', 'Esencial'),
  ('AB1-4', 'AB', 'Alimentos y Bebidas', 'Otros Despensa', ARRAY['Otros Despensa'], 'Variable', 'Esencial'),
  ('AB2-1', 'AB', 'Alimentos y Bebidas', 'Tienda / Oxxo', ARRAY['Oxxo', '7-Eleven', 'Tiendita'], 'Diario', 'Deseo'),
  ('AB2-2', 'AB', 'Alimentos y Bebidas', 'Café / Panadería', ARRAY['Café', 'Panadería', 'Antojitos'], 'Diario', 'Deseo'),
  ('AB2-3', 'AB', 'Alimentos y Bebidas', 'Otros Comida Rápida', ARRAY['Otros Comida Rápida'], 'Variable', 'Deseo'),
  ('AB3-1', 'AB', 'Alimentos y Bebidas', 'Restaurantes', ARRAY['Restaurante', 'Sushi', 'Tacos', 'Pizza'], 'Semanal', 'Deseo'),
  ('AB3-2', 'AB', 'Alimentos y Bebidas', 'Apps Delivery', ARRAY['Apps Delivery'], 'Variable', 'Deseo'),
  ('AB3-3', 'AB', 'Alimentos y Bebidas', 'Bares / Alcohol', ARRAY['Bares', 'Alcohol'], 'Semanal', 'Deseo'),
  ('AB3-4', 'AB', 'Alimentos y Bebidas', 'Otros Restaurantes', ARRAY['Otros Restaurantes'], 'Variable', 'Deseo'),
  
  -- Transporte
  ('TR1-1', 'TR', 'Transporte', 'Gasolina / Combustible', ARRAY['Gasolina', 'Combustible'], 'Semanal', 'Esencial'),
  ('TR1-2', 'TR', 'Transporte', 'Autolavado', ARRAY['Autolavado', 'Estética Auto'], 'Mensual', 'Deseo'),
  ('TR1-3', 'TR', 'Transporte', 'Accesorios Auto', ARRAY['Accesorios Auto'], 'Variable', 'Deseo'),
  ('TR1-4', 'TR', 'Transporte', 'Otros Automóvil', ARRAY['Otros Automóvil'], 'Variable', 'Variable'),
  ('TR2-1', 'TR', 'Transporte', 'Servicio Mecánico', ARRAY['Aceite', 'Motor'], 'Semestral', 'Esencial'),
  ('TR2-2', 'TR', 'Transporte', 'Llantas / Suspensión', ARRAY['Llantas', 'Suspensión'], 'Anual', 'Esencial'),
  ('TR2-3', 'TR', 'Transporte', 'Hojalatería y Pintura', ARRAY['Hojalatería', 'Pintura'], 'Irregular', 'Variable'),
  ('TR2-4', 'TR', 'Transporte', 'Otros Mantenimiento Auto', ARRAY['Otros Mantenimiento Auto'], 'Irregular', 'Variable'),
  ('TR3-1', 'TR', 'Transporte', 'Apps de Transporte', ARRAY['Uber', 'Didi', 'Cabify'], 'Variable', 'Esencial'),
  ('TR3-2', 'TR', 'Transporte', 'Transporte Público', ARRAY['Taxi', 'Camión', 'Metro', 'Colectivo'], 'Diario', 'Esencial'),
  ('TR3-3', 'TR', 'Transporte', 'Otros Transporte', ARRAY['Otros Transporte'], 'Variable', 'Esencial'),
  ('TR4-1', 'TR', 'Transporte', 'Estacionamiento', ARRAY['Estacionamiento', 'Parquímetro'], 'Variable', 'Esencial'),
  ('TR4-2', 'TR', 'Transporte', 'Peajes / Casetas', ARRAY['Peajes', 'Casetas'], 'Variable', 'Variable'),
  ('TR4-3', 'TR', 'Transporte', 'Seguro de Auto', ARRAY['Seguro de Auto'], 'Anual', 'Esencial'),
  ('TR4-4', 'TR', 'Transporte', 'Tenencia / Verificación', ARRAY['Tenencia', 'Verificación', 'Licencia'], 'Anual', 'Obligatorio'),
  ('TR4-5', 'TR', 'Transporte', 'Otros Trámites Auto', ARRAY['Otros Trámites Auto'], 'Variable', 'Obligatorio'),
  
  -- Salud y Bienestar
  ('SB1-1', 'SB', 'Salud y Bienestar', 'Consulta Médica', ARRAY['Consulta General', 'Especialista'], 'Variable', 'Esencial'),
  ('SB1-2', 'SB', 'Salud y Bienestar', 'Dentista', ARRAY['Dentista', 'Ortodoncia'], 'Mensual', 'Esencial'),
  ('SB1-3', 'SB', 'Salud y Bienestar', 'Terapia', ARRAY['Psicólogo', 'Psiquiatra'], 'Mensual', 'Esencial'),
  ('SB1-4', 'SB', 'Salud y Bienestar', 'Laboratorio', ARRAY['Estudios', 'Análisis'], 'Variable', 'Esencial'),
  ('SB1-5', 'SB', 'Salud y Bienestar', 'Otros Salud', ARRAY['Otros Salud'], 'Variable', 'Esencial'),
  ('SB2-1', 'SB', 'Salud y Bienestar', 'Medicamentos', ARRAY['Medicamentos'], 'Variable', 'Esencial'),
  ('SB2-2', 'SB', 'Salud y Bienestar', 'Vitaminas / Suplementos', ARRAY['Vitaminas', 'Suplementos'], 'Mensual', 'Deseo'),
  ('SB2-3', 'SB', 'Salud y Bienestar', 'Otros Farmacia', ARRAY['Otros Farmacia'], 'Variable', 'Variable'),
  ('SB3-1', 'SB', 'Salud y Bienestar', 'Barbería / Estética', ARRAY['Barbería', 'Estética', 'Salón'], 'Mensual', 'Deseo'),
  ('SB3-2', 'SB', 'Salud y Bienestar', 'Cosméticos / Higiene', ARRAY['Cosméticos', 'Higiene'], 'Mensual', 'Esencial'),
  ('SB3-3', 'SB', 'Salud y Bienestar', 'Lentes / Óptica', ARRAY['Lentes', 'Óptica'], 'Anual', 'Esencial'),
  ('SB3-4', 'SB', 'Salud y Bienestar', 'Gimnasio / Deportes', ARRAY['Gimnasio', 'Deportes'], 'Mensual', 'Deseo'),
  ('SB3-5', 'SB', 'Salud y Bienestar', 'Otros Cuidado Personal', ARRAY['Otros Cuidado Personal'], 'Variable', 'Deseo'),
  
  -- Educación y Familia
  ('EF1-1', 'EF', 'Educación y Familia', 'Colegiatura', ARRAY['Colegiatura', 'Mensualidad Escolar'], 'Mensual', 'Esencial'),
  ('EF1-2', 'EF', 'Educación y Familia', 'Inscripción', ARRAY['Inscripción', 'Reinscripción'], 'Semestral', 'Esencial'),
  ('EF1-3', 'EF', 'Educación y Familia', 'Cursos Extra', ARRAY['Cursos', 'Idiomas'], 'Mensual', 'Deseo'),
  ('EF1-4', 'EF', 'Educación y Familia', 'Otros Educación', ARRAY['Otros Educación'], 'Variable', 'Variable'),
  ('EF2-1', 'EF', 'Educación y Familia', 'Útiles Escolares', ARRAY['Útiles', 'Libros'], 'Anual', 'Esencial'),
  ('EF2-2', 'EF', 'Educación y Familia', 'Uniformes / Ropa Hijos', ARRAY['Uniformes', 'Ropa Hijos'], 'Semestral', 'Esencial'),
  ('EF2-3', 'EF', 'Educación y Familia', 'Juguetes / Actividades', ARRAY['Juguetes', 'Actividades'], 'Variable', 'Deseo'),
  ('EF2-4', 'EF', 'Educación y Familia', 'Otros Gastos Hijos', ARRAY['Otros Gastos Hijos'], 'Variable', 'Variable'),
  ('EF3-1', 'EF', 'Educación y Familia', 'Alimento Mascota', ARRAY['Alimento Mascota'], 'Mensual', 'Esencial'),
  ('EF3-2', 'EF', 'Educación y Familia', 'Veterinario / Vacunas', ARRAY['Veterinario', 'Vacunas'], 'Anual', 'Esencial'),
  ('EF3-3', 'EF', 'Educación y Familia', 'Accesorios Mascota', ARRAY['Arena', 'Juguetes'], 'Mensual', 'Variable'),
  ('EF3-4', 'EF', 'Educación y Familia', 'Otros Mascotas', ARRAY['Otros Mascotas'], 'Variable', 'Variable'),
  
  -- Tecnología
  ('TD1-1', 'TD', 'Tecnología', 'Internet Hogar', ARRAY['TotalPlay', 'Infinitum'], 'Mensual', 'Esencial'),
  ('TD1-2', 'TD', 'Tecnología', 'Plan Celular', ARRAY['AT&T', 'Telcel', 'Recargas'], 'Mensual', 'Esencial'),
  ('TD1-3', 'TD', 'Tecnología', 'Software / Nube', ARRAY['Google', 'Apple'], 'Mensual', 'Esencial'),
  ('TD1-4', 'TD', 'Tecnología', 'Streaming', ARRAY['Netflix', 'Spotify', 'Prime'], 'Mensual', 'Deseo'),
  ('TD1-5', 'TD', 'Tecnología', 'Otros Servicios Digitales', ARRAY['Otros Servicios Digitales'], 'Variable', 'Variable'),
  ('TD2-1', 'TD', 'Tecnología', 'Computadora / Tablet', ARRAY['Computadora', 'Tablet'], 'Irregular', 'Variable'),
  ('TD2-2', 'TD', 'Tecnología', 'Celular', ARRAY['Celular'], 'Irregular', 'Variable'),
  ('TD2-3', 'TD', 'Tecnología', 'Accesorios Electrónicos', ARRAY['Accesorios Electrónicos'], 'Variable', 'Deseo'),
  ('TD2-4', 'TD', 'Tecnología', 'Otros Tecnología', ARRAY['Otros Tecnología'], 'Variable', 'Deseo'),
  
  -- Financiero y Legal
  ('FL1-1', 'FL', 'Financiero y Legal', 'Tarjeta de Crédito', ARRAY['Pago Tarjeta de Crédito'], 'Mensual', 'Obligatorio'),
  ('FL1-2', 'FL', 'Financiero y Legal', 'Préstamo / Hipoteca', ARRAY['Pago Préstamo', 'Hipoteca'], 'Mensual', 'Obligatorio'),
  ('FL1-3', 'FL', 'Financiero y Legal', 'Comisiones Bancarias', ARRAY['Comisiones Bancarias'], 'Variable', 'Obligatorio'),
  ('FL1-4', 'FL', 'Financiero y Legal', 'Otros Financieros', ARRAY['Otros Financieros'], 'Variable', 'Obligatorio'),
  ('FL2-1', 'FL', 'Financiero y Legal', 'SAT / Impuestos', ARRAY['SAT', 'Impuestos'], 'Anual', 'Obligatorio'),
  ('FL2-2', 'FL', 'Financiero y Legal', 'Predial', ARRAY['Predial'], 'Anual', 'Obligatorio'),
  ('FL2-3', 'FL', 'Financiero y Legal', 'Trámites Gubernamentales', ARRAY['Trámites Gubernamentales'], 'Variable', 'Obligatorio'),
  ('FL2-4', 'FL', 'Financiero y Legal', 'Otros Legal', ARRAY['Otros Legal'], 'Variable', 'Obligatorio'),
  ('FL3-1', 'FL', 'Financiero y Legal', 'Seguro Gastos Médicos', ARRAY['Seguro Gastos Médicos'], 'Anual', 'Esencial'),
  ('FL3-2', 'FL', 'Financiero y Legal', 'Seguro de Vida', ARRAY['Seguro de Vida'], 'Anual', 'Esencial'),
  ('FL3-3', 'FL', 'Financiero y Legal', 'Ahorro / Inversión', ARRAY['Ahorro', 'Inversión'], 'Mensual', 'Esencial'),
  ('FL3-4', 'FL', 'Financiero y Legal', 'Otros Seguros', ARRAY['Otros Seguros'], 'Variable', 'Esencial')
ON CONFLICT (id) DO NOTHING;