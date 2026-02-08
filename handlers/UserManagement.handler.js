import pool from "../utils/database.utils.js";
import bcrypt from "bcryptjs";


export async function CreateNewUser(email, username, password) {
    const existingUser = await pool.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [email, username]
    );

    if(existingUser.rows.length > 0) {
        const existing = existingUser.rows[0];
        if(existing.email === email) {
            throw new Error('Email already exists.');
        }
        throw new Error('Username already taken.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
        `INSERT INTO users (email, username, password_hash) 
         VALUES ($1, $2, $3) 
         RETURNING id, email, username, created_at`,
        [email, username, hashedPassword]
    );
    
    return result.rows[0];


}

export async function FindUserByEmail(email) {
    const result = await pool.query(
        `SELECT id, username, email, created_at FROM users
        WHERE email = $1`,
        [email]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
}

export async function FindUserById(id) {
    const result = await pool.query(
        `SELECT id, username, email, created_at FROM users
        WHERE id = $1`,
        [id]
    );

    return result.rows.length > 0 ? result.rows[0] : null;
}

export async function ValidateUserPassword(email, password) {
    const result = await pool.query(
        'SELECT id, username, email, password_hash, created_at FROM users WHERE email = $1',
        [email]
    );

    if(result.rows.length === 0) {
        await bcrypt.hash(password, 10);
        return null;
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if(isValid) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            created_at: user.created_at
        };
    }

    return null;
}
