import e from "express";
import docsRouter from "./routes/docs.route.js";
import { initializeStorage } from "./utils/StorageManagement.utils.js";

const app = e();
const PORT = process.env.PORT || 3000;

app.use(e.json());
app.use(e.urlencoded({extended: true}));

app.use('/docs', docsRouter);

try {
    await initializeStorage();
    app.listen(PORT, () => {
        console.log(`Server listening at port ${PORT}`);
    });
} catch(e) {
    console.log("Error starting server", e);
}

