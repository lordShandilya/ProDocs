import e from "express";
import cors from "cors";
import { InitializeRooms } from "./socket/rooms.socket.js";
import docsRouter from "./routes/docs.route.js";
import { initializeStorage } from "./handlers/StorageManagement.handler.js";

const app = e();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(e.json());
app.use(e.urlencoded({extended: true}));

app.use('/docs', docsRouter);

try {
    await initializeStorage();
    const httpServer = InitializeRooms( app );

    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

} catch(e) {
    console.log("Error starting server", e);
}

