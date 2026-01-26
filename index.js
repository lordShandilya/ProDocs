import e from "express";
import { WebSocketServer } from "ws"; 
import docsRouter from "./routes/docs.route.js";
import { initializeStorage } from "./handlers/StorageManagement.handler.js";

const app = e();
const PORT = process.env.PORT || 3000;

app.use(e.json());
app.use(e.urlencoded({extended: true}));

app.use('/docs', docsRouter);

try {
    await initializeStorage();
    const server = app.listen(PORT, () => {
        console.log(`Server listening at port ${PORT}`);
    });

    const wss = new WebSocketServer({ server });



} catch(e) {
    console.log("Error starting server", e);
}

