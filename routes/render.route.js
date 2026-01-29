import { Router } from "express";
import pt from "path";
import { fileURLToPath } from "node:url";

const __dirname = pt.dirname(fileURLToPath(import.meta.url));



const router = Router();

router.get('/', (req, res) => {
    res.sendFile(pt.join(__dirname, '../public/test.html'));
});

export default router;