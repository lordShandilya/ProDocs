import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.query('SELECT NOW()', (err, res) => {
    if(err) {
        console.error('Database connection error: ', err);
    } else {
        console.log('Database connected successfully: ', res.rows[0].now);
    }
});

export default pool;