import { Router } from "express";
import { CreateNewDocument, DeleteDocument, FindDocumentById, ListAllDocuments, UpdateDocumentContent } from "../handlers/StorageManagement.handler.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/create', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    
    try {
        const document = await CreateNewDocument(title, content || '', req.user.id);
        res.json({
            msg: "New resource created.",
            doc: {
                id: document.id,
                title: document.title
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }

});


router.get('/all', authenticateToken, (req, res) => {
    
    try {
        const documents = ListAllDocuments();
        res.json({ files: documents });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    
});

router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const document = await FindDocumentById(id);
        res.status(200).json(document);

    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});


router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    try {
        const document = await UpdateDocumentContent(id, content);
        res.json({msg: 'Document Updates Sucessfuly.', document});
    } catch(err) {
        res.status(500).json({ error: err.message});
    }
});

router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await DeleteDocument(id, req.user.id);
        res.json({ msg: 'Document Deleted.', result});
    } catch(err) {
        if (err.message.includes('Unauthorized')) {
            return res.status(403).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
})

export default router;