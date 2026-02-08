import e from "express";
import cors from "cors";
import dotenv from "dotenv";
import { InitializeRooms } from "./socket/rooms.socket.js";
import docsRouter from "./routes/docs.route.js";
import renderRouter from "./routes/render.route.js";
import authRouter from "./routes/auth.route.js";


dotenv.config();
const app = e();
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: '*'
}));
app.use(e.json());
app.use(e.urlencoded({extended: true}));

app.use('/', renderRouter);
app.use('/docs', docsRouter);
app.use('/auth', authRouter);


try {

    const httpServer = InitializeRooms( app );

    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

} catch(e) {
    console.log("Error starting server", e);
}

