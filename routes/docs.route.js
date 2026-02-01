import { Router } from "express";
import { CreateNewFile, FindFileById, ListAllFiles } from "../handlers/StorageManagement.handler.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/create', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    
    try {
        await CreateNewFile(title, content);
        res.json({msg: "New resource created."});

    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});


router.get('/all', authenticateToken, (req, res) => {
    const list = ListAllFiles();
    
    res.json({ files: list });
});

router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const { title, content } = await FindFileById(id);
        res.status(200).json({ title, content });

    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


export default router;