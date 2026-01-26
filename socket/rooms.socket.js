import { Server } from 'socket.io';
import { createServer } from 'http';
const rooms = {};
let currentRoom;

export function InitializeRooms( app ) {
    const httpServer = createServer(app);
    const io = new Server({
        cors: {origin: "*"}
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

            socket.emit('message', `User ${socket} has joined!`);
        })
    })

    io.on('document-update', (data) => {
        //TODO: Implement updation logic. 
    })
}

