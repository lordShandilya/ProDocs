import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { DebouncedUpdateFileById, ForceSave } from '../handlers/StorageManagement.handler.js';


export function InitializeRooms( app ) {
    const httpServer = createServer(app);
    const io = new Server(httpServer,{
        cors: {origin: '*'
        }
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if(!token) {
            return next(new Error('Authentication Error: No token provided.'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            socket.user = {
                id: decoded.id,
                username: decoded.username,
                email: decoded.email
            };

            next();
        } catch(e) {
            next(new Error('Authentication Error: Invalid Token'));
        }
    })


    io.on('connection', (socket) => {
        console.log("user Connecte: ", socket.id);

        socket.currentRoom = null;

        socket.on('join-document', (document_id) => {
            if(socket.currentRoom) {
                socket.leave(socket.currentRoom);
                console.log(`User left ${socket.currentRoom}`);
            }
            socket.join(document_id);
            socket.currentRoom = document_id;
            console.log(`User ${socket.user.username} joined ${document_id} room`);

            socket.to(document_id).emit('message', `User ${socket.user.username} has joined!`);
        });

        socket.on('document-update', (update) => {
            try {
                DebouncedUpdateFileById(socket.currentRoom, update);
                socket.to(socket.currentRoom).emit('document-update', {
                    content: update,
                    author: socket.user.username
                });
            } catch(e) {
                console.log("Error updating document: ", e);
            }
        });

        socket.on('disconnect', () => {
            ForceSave(socket.currentRoom);
            socket.leave(socket.currentRoom);
            console.log(`User ${socket.user.username} disconnected.`);
        });
    })

    return httpServer;
    
}

