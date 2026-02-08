import pool from '../utils/database.utils.js';
import fs from 'fs';

async function initializeDatabase() {
    const schema = fs.readFileSync('./schema.sql', 'utf-8');

    try {
        await pool.query(schema);
        console.log('Database schema created successfully.');
    } catch (e) {
        console.error('Error creating schema:', e);
    } finally {
        await pool.end();
    }
}

initializeDatabase();
