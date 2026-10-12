const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pg = new Client({
  connectionString: process.env.DATABASE_URL
});

const supabaseAdmin = createClient(
  'https://zynfzowcuhozbpnosztt.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  await pg.connect();
  console.log('Connected to PG');

  // Add columns if not exist
  await pg.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS image_url TEXT;');
  await pg.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS career_name TEXT;');
  await pg.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS university_name TEXT;');
  await pg.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sales_count INT DEFAULT 0;');
  await pg.query('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 5.0;');

  // Insert or get UCSI university
  await pg.query(`
    INSERT INTO universities (name, short_name, email_domain, city)
    VALUES ('Universidad Católica Nuestra Señora de la Asunción Campus San Ignacio', 'UCSI', 'uc.edu.py', 'San Ignacio Misiones')
    ON CONFLICT DO NOTHING;
  `);

  const ucsi = await pg.query("SELECT id FROM universities WHERE short_name = 'UCSI' LIMIT 1");
  const ucsiId = ucsi.rows[0]?.id;
  console.log('UCSI ID:', ucsiId);

  // Clear old transactions, chats, reviews, listings
  await pg.query('DELETE FROM messages;');
  await pg.query('DELETE FROM conversations;');
  await pg.query('DELETE FROM reviews;');
  await pg.query('DELETE FROM favorites;');
  await pg.query('DELETE FROM listing_images;');
  await pg.query('DELETE FROM listings;');
  console.log('Cleared listings, reviews, conversations, messages, favorites');

  // Target users
  const usersToCreate = [
    {
      name: 'Jesus Gonzalez',
      email: 'jesus.gonzalez@uc.edu.py',
      faculty: 'Facultad de Ciencias Jurídicas',
      career: 'Derecho y Ciencias Sociales (UCSI)',
      bio: 'Estudiante de 4to año de Derecho en UCSI Campus San Ignacio. Puntual en biblioteca y acceso principal.',
      sales: 18,
      rating: 4.9
    },
    {
      name: 'Belen Villalba',
      email: 'belen.villalba@uc.edu.py',
      faculty: 'Facultad de Ciencias de la Salud',
      career: 'Enfermería (UCSI)',
      bio: 'Estudiante de Enfermería en el Campus San Ignacio. Cuido mucho mis libros y uniformes.',
      sales: 14,
      rating: 4.8
    },
    {
      name: 'Jennifer Fretes',
      email: 'jennifer.fretes@uc.edu.py',
      faculty: 'Facultad de Ciencias Contables y Administrativas',
      career: 'Administración de Empresas (UCSI)',
      bio: 'Estudiante de Administración en UCSI San Ignacio. Apuntes y calculadoras en excelente estado.',
      sales: 11,
      rating: 4.7
    },
    {
      name: 'Luca Mosqueda',
      email: 'luca.mosqueda@uc.edu.py',
      faculty: 'Facultad de Ciencias y Tecnología',
      career: 'Análisis de Sistemas Informáticos (UCSI)',
      bio: 'Estudiante de Informática en UCSI. Tecnología, notebooks y programación en Misiones.',
      sales: 8,
      rating: 4.6
    }
  ];

  const createdUserMap = {};

  for (const u of usersToCreate) {
    const existing = await pg.query('SELECT id FROM auth.users WHERE email = $1', [u.email]);
    let uid = existing.rows[0]?.id;
    if (!uid) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { full_name: u.name, university: 'UCSI' }
      });
      if (error) console.error('Error creating user:', u.email, error);
      uid = data.user.id;
    } else {
      await supabaseAdmin.auth.admin.updateUserById(uid, {
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { full_name: u.name, university: 'UCSI' }
      });
    }

    createdUserMap[u.name] = uid;

    // Upsert profile
    await pg.query(`
      INSERT INTO profiles (id, full_name, bio, phone, verified_email, university_id, university_name, career_name, sales_count, rating)
      VALUES ($1, $2, $3, '0981 123 456', true, $4, 'Universidad Católica Campus San Ignacio (UCSI)', $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        bio = EXCLUDED.bio,
        university_id = EXCLUDED.university_id,
        university_name = EXCLUDED.university_name,
        career_name = EXCLUDED.career_name,
        sales_count = EXCLUDED.sales_count,
        rating = EXCLUDED.rating;
    `, [uid, u.name, u.bio, ucsiId, u.career, u.sales, u.rating]);

    console.log('User synced:', u.name, u.email, uid);
  }

  // Get categories
  const cats = await pg.query('SELECT id, name FROM categories');
  const catMap = {};
  cats.rows.forEach(c => { catMap[c.name] = c.id; });
  console.log('Categories:', catMap);

  // Seed listings for UCSI Campus San Ignacio
  const seedListings = [
    {
      seller: 'Jesus Gonzalez',
      title: 'Manual de Derecho Civil - Personas y Familia',
      description: 'Texto fundamental para Derecho Civil I en UCSI. En excelente estado, incluye notas de jurisprudencia paraguaya.',
      price: 85000,
      cat: catMap['Libros'],
      condition: 'good',
      faculty: 'Derecho (UCSI)',
      meeting: 'Biblioteca Central UCSI Campus San Ignacio',
      exchange: true,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
    },
    {
      seller: 'Jesus Gonzalez',
      title: 'Calculadora Financiera Casio FC-200V para Contabilidad',
      description: 'Ideal para matemáticas financieras, cálculo de tasas e interés. Con tapa protectora y batería nueva.',
      price: 90000,
      cat: catMap['Calculadoras'],
      condition: 'like_new',
      faculty: 'Ciencias Contables (UCSI)',
      meeting: 'Cantina Campus San Ignacio',
      exchange: false,
      image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80'
    },
    {
      seller: 'Belen Villalba',
      title: 'Ambo Clínico Blanco Bordado Talle S - Enfermería UCSI',
      description: 'Uniforme reglamentario para prácticas hospitalarias de Enfermería en San Ignacio. Tela antimicrobiana, muy cuidado.',
      price: 110000,
      cat: catMap['Uniformes'],
      condition: 'like_new',
      faculty: 'Enfermería (UCSI)',
      meeting: 'Acceso Principal Campus San Ignacio Misiones',
      exchange: false,
      image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=600&auto=format&fit=crop&q=80'
    },
    {
      seller: 'Belen Villalba',
      title: 'Mochila Universitaria Impermeable con Puerto USB',
      description: 'Mochila espaciosa acolchada para notebook de hasta 15.6 pulgadas. Muy resistente para el día a día universitario.',
      price: 130000,
      cat: catMap['Mochilas'],
      condition: 'good',
      faculty: 'Campus San Ignacio',
      meeting: 'Patio Central UCSI',
      exchange: true,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80'
    },
    {
      seller: 'Jennifer Fretes',
      title: 'Libro Principios de Administración Financiera Gitman',
      description: '14ª Edición en español. Clásico indispensable para Administración y Contabilidad en UCSI. Impecable estado.',
      price: 95000,
      cat: catMap['Libros'],
      condition: 'like_new',
      faculty: 'Administración (UCSI)',
      meeting: 'Biblioteca Central UCSI',
      exchange: false,
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80'
    },
    {
      seller: 'Jennifer Fretes',
      title: 'Resúmenes y Guías de Estudio de Micro y Macroeconomía',
      description: 'Cuadernillo anillado a color con ejercicios resueltos de exámenes anteriores en UCSI Campus San Ignacio.',
      price: 35000,
      cat: catMap['Apuntes'],
      condition: 'good',
      faculty: 'Ciencias Contables (UCSI)',
      meeting: 'Hall de Aulas UCSI Misiones',
      exchange: true,
      image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&auto=format&fit=crop&q=80'
    },
    {
      seller: 'Luca Mosqueda',
      title: 'Notebook Lenovo ThinkPad T480 Core i5 8GB 256GB SSD',
      description: 'Batería con 4hs de duración, cargador original tipo C, teclado retroiluminado. Lista para programar y proyectos.',
      price: 1850000,
      cat: catMap['Tecnología'],
      condition: 'good',
      faculty: 'Informática (UCSI)',
      meeting: 'Laboratorio de Computación UCSI San Ignacio',
      exchange: false,
      image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'
    },
    {
      seller: 'Luca Mosqueda',
      title: 'Guía Completa de Algorítmica y Base de Datos SQL',
      description: 'Compendio de apuntes con diagramas entidad-relación y consultas SQL explicadas paso a paso.',
      price: 45000,
      cat: catMap['Apuntes'],
      condition: 'like_new',
      faculty: 'Informática (UCSI)',
      meeting: 'Cantina Campus San Ignacio',
      exchange: true,
      image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80'
    }
  ];

  for (const item of seedListings) {
    const sellerId = createdUserMap[item.seller];
    const ins = await pg.query(`
      INSERT INTO listings (seller_id, title, description, price_gs, category_id, condition, faculty, meeting_point, accepts_exchange, university_id, status, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active', $11)
      RETURNING id;
    `, [sellerId, item.title, item.description, item.price, item.cat, item.condition, item.faculty, item.meeting, item.exchange, ucsiId, item.image]);
    
    const listId = ins.rows[0]?.id;
    if (listId && item.image) {
      await pg.query('INSERT INTO listing_images (listing_id, path, position) VALUES ($1, $2, 0)', [listId, item.image]);
    }
  }
  console.log('Seeded listings with images');

  // Seed reviews between each other to create authentic ranking
  // Seed reviews linked to listings
  const userListings = await pg.query('SELECT id, seller_id FROM listings');
  const userListingMap = {};
  userListings.rows.forEach(l => {
    userListingMap[l.seller_id] = l.id;
  });

  const revs = [
    { from: 'Belen Villalba', to: 'Jesus Gonzalez', stars: 5, comment: 'Excelente vendedor en UCSI, muy puntual en la biblioteca y libro impecable.' },
    { from: 'Luca Mosqueda', to: 'Jesus Gonzalez', stars: 5, comment: 'Súper recomendado! La calculadora funciona perfecta.' },
    { from: 'Jennifer Fretes', to: 'Jesus Gonzalez', stars: 5, comment: 'Trato muy amable, compañero confiable del campus.' },
    { from: 'Jesus Gonzalez', to: 'Belen Villalba', stars: 5, comment: 'Ambo en excelente estado, tal cual las fotos!' },
    { from: 'Jennifer Fretes', to: 'Belen Villalba', stars: 5, comment: 'Puntualísima en el acceso principal de UCSI.' },
    { from: 'Luca Mosqueda', to: 'Belen Villalba', stars: 4, comment: 'Buena comunicación para coordinar el encuentro.' },
    { from: 'Jesus Gonzalez', to: 'Jennifer Fretes', stars: 5, comment: 'Los apuntes de economía están súper completos, me salvaron el parcial.' },
    { from: 'Belen Villalba', to: 'Jennifer Fretes', stars: 5, comment: 'Excelente compañera, muy responsable!' },
    { from: 'Jesus Gonzalez', to: 'Luca Mosqueda', stars: 5, comment: 'La notebook anda de 10, muy buen precio.' },
    { from: 'Jennifer Fretes', to: 'Luca Mosqueda', stars: 4, comment: 'Todo bien coordinado en el lab de informática.' }
  ];

  for (const r of revs) {
    const revId = createdUserMap[r.from];
    const redId = createdUserMap[r.to];
    const targetListingId = userListingMap[redId];
    if (targetListingId) {
      await pg.query(`
        INSERT INTO reviews (listing_id, reviewer_id, reviewed_id, stars, comment)
        VALUES ($1, $2, $3, $4, $5);
      `, [targetListingId, revId, redId, r.stars, r.comment]);
    }
  }
  console.log('Seeded reviews with listing_ids');

  // Re-create seller_ranking view
  await pg.query('DROP VIEW IF EXISTS seller_ranking CASCADE;');
  await pg.query(`
    CREATE VIEW seller_ranking AS
    SELECT 
      p.id AS seller_id,
      p.full_name,
      p.avatar_url,
      p.university_name,
      p.career_name,
      p.verified_email,
      COALESCE(p.sales_count, 0) AS sales_count,
      COALESCE(ROUND(AVG(r.stars), 1), p.rating, 5.0) AS avg_rating,
      COUNT(r.id) AS review_count
    FROM profiles p
    LEFT JOIN reviews r ON r.reviewed_id = p.id
    WHERE p.full_name IS NOT NULL AND p.full_name != ''
    GROUP BY p.id, p.full_name, p.avatar_url, p.university_name, p.career_name, p.verified_email, p.sales_count, p.rating
    ORDER BY avg_rating DESC, sales_count DESC;
  `);
  console.log('Updated seller_ranking view');

  const rankRes = await pg.query('SELECT * FROM seller_ranking');
  console.log('Ranking results:', rankRes.rows);

  await pg.end();
}

run().catch(console.error);
