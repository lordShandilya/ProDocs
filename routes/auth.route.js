import { Router } from "express";
import jwt from "jsonwebtoken";
import { CreateNewUser, ValidateUserPassword, FindUserByEmail } from "../handlers/UserManagement.handler.js";

const router = Router();

function validEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    
    
    if (!email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (!validEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }
    
    try {
        const user = await CreateNewUser(email, username, password);
        
        const token = jwt.sign(
            {
                id: user.id,      
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({ 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            }, 
            token 
        });
    } catch (e) {
        if (e.message.includes('already exists')) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        res.status(500).json({ error: 'Failed to create user', e }); // Remove it later 
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    
    try {
        const user = await ValidateUserPassword(email, password);
        
        if (!user) { 
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            {
                id: user.id,      
                username: user.username,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({ 
            user: { 
                id: user.id, 
                username: user.username, 
                email: user.email 
            }, 
            token 
        });
    } catch (e) {
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/verify', async (req, res) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {  
        return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await FindUserByEmail(decoded.email);
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        res.status(200).json({ user });
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        res.status(401).json({ error: 'Invalid token' });
    }
});

export default router;