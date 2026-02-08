import pool from '../utils/database.utils.js';

export async function CreateNewDocument(title, content, ownerId) {
    const result = await pool.query(
        `INSERT INTO documents (title, content, owner_id) 
         VALUES ($1, $2, $3) 
         RETURNING id, title, content, owner_id, created_at, updated_at`,
        [title, content || '', ownerId]
    );
    
    return result.rows[0];
}

export async function FindDocumentById(documentId) {
    const result = await pool.query(
        `SELECT d.id, d.title, d.content, d.owner_id, d.created_at, d.updated_at,
                u.username as owner_username, u.email as owner_email
         FROM documents d
         JOIN users u ON d.owner_id = u.id
         WHERE d.id = $1`,
        [documentId]
    );
    
    if (result.rows.length === 0) {
        throw new Error('Document not found');
    }
    
    return result.rows[0];
}

export async function UpdateDocumentContent(documentId, content) {
    const result = await pool.query(
        `UPDATE documents 
         SET content = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2 
         RETURNING id, title, content, updated_at`,
        [content, documentId]
    );
    
    if (result.rows.length === 0) {
        throw new Error('Document not found');
    }
    
    return result.rows[0];
}

export async function ListDocumentsByOwner(ownerId) {
    const result = await pool.query(
        `SELECT id, title, created_at, updated_at 
         FROM documents 
         WHERE owner_id = $1 
         ORDER BY updated_at DESC`,
        [ownerId]
    );
    
    return result.rows;
}

export async function ListAllDocuments() {
    const result = await pool.query(
        `SELECT d.id, d.title, d.created_at, d.updated_at,
                u.username as owner_username
         FROM documents d
         JOIN users u ON d.owner_id = u.id
         ORDER BY d.updated_at DESC`
    );
    
    return result.rows;
}

export async function DeleteDocument(documentId, userId) {
    // Check ownership
    const doc = await pool.query(
        'SELECT owner_id FROM documents WHERE id = $1',
        [documentId]
    );
    
    if (doc.rows.length === 0) {
        throw new Error('Document not found');
    }
    
    if (doc.rows[0].owner_id !== userId) {
        throw new Error('Unauthorized: You do not own this document');
    }
    
    await pool.query('DELETE FROM documents WHERE id = $1', [documentId]);
    
    return { message: 'Document deleted successfully' };
}