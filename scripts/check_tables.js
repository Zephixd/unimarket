const { Client } = require('pg');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const pg = new Client({
  connectionString: process.env.DATABASE_URL
});
async function check() {
  await pg.connect();
  const cols = await pg.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reviews'");
  console.log('Reviews columns:', cols.rows);
  await pg.end();
}
check();
