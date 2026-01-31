import fs from "node:fs/promises";
import pt from "path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";

const __dirname = pt.dirname(fileURLToPath(import.meta.url));
const UserDirectory = new Map(); 


const usersDir = pt.join(__dirname, '../users');
await fs.mkdir(usersDir, { recursive: true });

export async function initializeUsers() {
    try {
        const files = await fs.readdir(usersDir); 
        for (const file of files) { 
            if (file.endsWith('_meta.json')) {
                try {
                    const metaData = JSON.parse(
                        await fs.readFile(pt.join(usersDir, file), 'utf-8')
                    );
                    const email = file.replace('_meta.json', '');
                    UserDirectory.set(email, {
                        id: metaData.id, 
                        username: metaData.username,
                        hashedPassword: metaData.hashedPassword,
                        createdAt: metaData.createdAt
                    });
                } catch (e) {
                    console.error(`Failed to load user file ${file}:`, e);
                    continue;
                }
            }
        }
        console.log(`Loaded ${UserDirectory.size} users`);
    } catch (e) {
        throw new Error('Unable to initialize users directory: ' + e.message);
    }
}

export async function CreateNewUser(email, username, password) {
    if (UserDirectory.has(email)) {
        throw new Error('Email already exists');
    }
    
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const createdAt = new Date().toISOString();
    const metaPath = pt.join(usersDir, `${email}_meta.json`);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        await fs.writeFile(
            metaPath,
            JSON.stringify({ id, username, hashedPassword, createdAt }, null, 2)
        );
        UserDirectory.set(email, { id, username, hashedPassword, createdAt });
        
        
        return { id, email, username, createdAt };
    } catch (e) {
        throw new Error('Failed to create user: ' + e.message);
    }
}

export async function FindUserByEmail(email) {
    const user = UserDirectory.get(email);
    if (!user) {
        return null; 
    }
    
    
    return {
        id: user.id,
        email,
        username: user.username,
        createdAt: user.createdAt
    };
}

export async function ValidateUserPassword(email, password) {
    const user = UserDirectory.get(email);
    
    
    if (!user) {
        
        await bcrypt.hash(password, 10);
        return null;
    }
    
    const isValid = await bcrypt.compare(password, user.hashedPassword);
    
    if (isValid) {
        return {
            id: user.id,
            email,
            username: user.username,
            createdAt: user.createdAt
        };
    }
    
    return null;
}
