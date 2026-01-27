import { Server } from 'socket.io';
import { createServer } from 'http';
import { DebouncedUpdateFileById, ForceSave } from '../handlers/StorageManagement.handler.js';


export function InitializeRooms( app ) {
    const httpServer = createServer(app);
    const io = new Server(httpServer,{
        cors: {origin: process.env.NODE_ENV === 'production'
        ? []
        : '*'}
    });


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
            console.log(`User joined ${document_id} room`);

            socket.to(document_id).emit('message', `User ${socket.id} has joined!`);
        });

        socket.on('document-update', (update) => {
            try {
                DebouncedUpdateFileById(socket.currentRoom, update);
                socket.to(socket.currentRoom).emit('document-update', update);
            } catch(e) {
                console.log("Error updating document: ", e);
            }
        });

        socket.on('disconnect', () => {
            ForceSave(socket.currentRoom);
            socket.leave(socket.currentRoom);
            console.log("User disconnected: ", socket.id);
        });
    })

    return httpServer;
    
}

