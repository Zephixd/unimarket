const { Client } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pg = new Client({
  connectionString: process.env.DATABASE_URL
});

async function setup() {
  await pg.connect();
  console.log('Connected to DB');

  // 1. Add columns to listings & profiles
  await pg.query(`
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS publication_type TEXT DEFAULT 'sale';
    ALTER TABLE listings ADD COLUMN IF NOT EXISTS exchange_for TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_year TEXT DEFAULT '3er Año';
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS points INT DEFAULT 180;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT ARRAY['Perfil verificado', 'Estudiante UCSI'];
  `);

  // 2. Categories
  const desiredCats = [
    { name: 'Libros, apuntes y materiales académicos', icon: 'book-open' },
    { name: 'Calculadoras', icon: 'calculator' },
    { name: 'Tecnología', icon: 'laptop' },
    { name: 'Accesorios electrónicos', icon: 'headphones' },
    { name: 'Mochilas y accesorios universitarios', icon: 'backpack' },
    { name: 'Uniformes', icon: 'shirt' },
    { name: 'Materiales de laboratorio', icon: 'flask-conical' },
    { name: 'Otros', icon: 'package' }
  ];

  for (const c of desiredCats) {
    const existing = await pg.query('SELECT id FROM categories WHERE name = $1', [c.name]);
    if (existing.rows.length === 0) {
      await pg.query('INSERT INTO categories (name, icon) VALUES ($1, $2)', [c.name, c.icon]);
    }
  }

  // 3. Reports table
  await pg.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id UUID,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
  `);
  await pg.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reports_all' AND tablename = 'reports') THEN
        CREATE POLICY reports_all ON reports FOR ALL USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `);

  // 4. Blocked users table
  await pg.query(`
    CREATE TABLE IF NOT EXISTS blocked_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      blocked_id UUID NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, blocked_id)
    );
    ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
  `);
  await pg.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'blocked_users_all' AND tablename = 'blocked_users') THEN
        CREATE POLICY blocked_users_all ON blocked_users FOR ALL USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `);

  // 5. Operations / Transactions table
  await pg.query(`
    CREATE TABLE IF NOT EXISTS operations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
      buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
      seller_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
      status TEXT DEFAULT 'iniciada',
      payment_method TEXT DEFAULT 'campus_cash',
      meeting_point TEXT,
      price_gs NUMERIC DEFAULT 0,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
  `);
  await pg.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'operations_all' AND tablename = 'operations') THEN
        CREATE POLICY operations_all ON operations FOR ALL USING (true) WITH CHECK (true);
      END IF;
    END $$;
  `);

  // Update existing listings to have good publication_type
  await pg.query(`
    UPDATE listings SET publication_type = 'both', exchange_for = 'Calculadora Casio fx-991LA o apuntes de Derecho Romano' WHERE accepts_exchange = true;
    UPDATE listings SET publication_type = 'sale' WHERE accepts_exchange = false OR accepts_exchange IS NULL;
    UPDATE listings SET category_id = 'a8d46f74-1020-4f50-84f3-4927504d351a' WHERE category_id IN ('b954ecf7-3147-45f2-9b85-5da9b5bf6b6f', 'd901a725-cf4d-4262-87b4-37d598634b81');
    UPDATE listings SET category_id = 'db883c7a-b9e9-4c5b-aeea-07c45f5dd968' WHERE category_id = '96d3f8c8-0e08-489a-9d77-dbcc4a6a1c61';
  `);

  const allCats = await pg.query('SELECT id, name FROM categories ORDER BY name');
  console.log('Categories in DB now:', allCats.rows);

  await pg.end();
  console.log('Schema successfully upgraded!');
}

setup().catch(err => {
  console.error('Error running setup:', err);
  process.exit(1);
});
