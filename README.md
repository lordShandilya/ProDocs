# 📝 Real-Time Collaborative Document Editor

A WebSocket-based collaborative document editing platform that enables multiple users to simultaneously edit documents with instant synchronization across all connected clients.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

- **Real-Time Collaboration**: Multiple users can edit the same document simultaneously with instant updates
- **Document Management**: Create, retrieve, and list documents via RESTful API
- **Persistent Storage**: Documents are saved to disk with metadata tracking
- **Automatic Recovery**: Server rebuilds document index from filesystem on restart
- **Optimized Writes**: Debounced file saves reduce disk I/O while maintaining data integrity
- **Room-Based Architecture**: WebSocket rooms ensure updates only reach relevant collaborators
- **CORS Enabled**: Cross-origin support for web-based clients

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client 1  │         │   Client 2  │         │   Client N  │
│  (Browser)  │         │  (Browser)  │         │  (Browser)  │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │    WebSocket          │    WebSocket          │    WebSocket
       │    Connection         │    Connection         │    Connection
       │                       │                       │
       └───────────────────────┴───────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Socket.io Server  │
                    │   (Document Rooms)  │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Express REST API  │
                    │   /docs endpoints   │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Storage Manager    │
                    │  (Debounced Writes) │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    File System      │
                    │  *.txt + *.meta.json│
                    └─────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/collaborative-doc-editor.git
cd collaborative-doc-editor
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file
```bash
PORT=3000
NODE_ENV=development
```

4. Start the server
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### REST Endpoints

#### Create Document
```http
POST /docs/create
Content-Type: application/json

{
  "title": "My Document",
  "content": "Initial content"
}

Response: 200 OK
{
  "msg": "New resource created."
}
```

#### Get Document by ID
```http
GET /docs/:id

Response: 200 OK
{
  "title": "My Document",
  "content": "Document content here..."
}

Error: 404 Not Found
{
  "error": "File not found"
}
```

#### List All Documents
```http
GET /docs/all

Response: 200 OK
{
  "files": [
    { "id": "abc123", "title": "My Document" },
    { "id": "xyz789", "title": "Another Doc" }
  ]
}
```

### WebSocket Events

#### Client → Server

**Join Document Room**
```javascript
socket.emit('join-document', documentId);
```

**Send Document Update**
```javascript
socket.emit('document-update', newContent);
```

#### Server → Client

**Receive Document Update**
```javascript
socket.on('document-update', (content) => {
  // Update editor with new content
});
```

**User Joined Notification**
```javascript
socket.on('message', (msg) => {
  // "User {socketId} has joined!"
});
```

## 🛠️ Technical Implementation

### Storage Strategy

Documents are stored using a dual-file approach:

```
storage/
  ├── abc123.txt              # Document content
  ├── abc123_meta.json        # { "title": "..." }
  ├── xyz789.txt
  └── xyz789_meta.json
```

**In-Memory Index:**
- Uses JavaScript `Map` for O(1) document lookups
- Reconstructed on server startup by scanning metadata files
- Gracefully handles corrupted files without breaking initialization

### Debounced File Writes

To optimize disk I/O, writes are debounced with a 2-second delay:

```javascript
User types: H → timer starts (2s)
User types: e → timer resets (2s)
User types: l → timer resets (2s)
User types: l → timer resets (2s)
User types: o → timer resets (2s)
User stops → 2s later: save "Hello" once
```

**Force Save on Disconnect:**
- Ensures pending changes are saved when users leave
- Prevents data loss on unexpected disconnections

### WebSocket Room Management

Socket.io's built-in room feature isolates document updates:

```javascript
// User joins document room
socket.join(documentId);

// Broadcast to room (excluding sender)
socket.to(documentId).emit('document-update', content);
```

## 📁 Project Structure

```
collaborative-doc-editor/
├── index.js                          # Server entry point
├── routes/
│   └── docs.route.js                 # REST API routes
├── handlers/
│   └── StorageManagement.handler.js  # WebSocket initialization
├── utils/
│   └── StorageManagement.utils.js    # File operations & persistence
├── storage/                          # Document storage directory
├── .env                              # Environment variables
├── .gitignore
└── package.json
```

## 🧪 Testing

### Manual Testing with Web Client

1. Start the server
2. Open the provided HTML client in multiple browser tabs
3. Create or join a document using the same document ID
4. Type in one tab and observe real-time updates in others

### Testing Persistence

1. Create a document and add content
2. Wait 2+ seconds for debounced save
3. Stop the server (Ctrl+C)
4. Restart the server
5. Retrieve the document - content should persist

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |

### Adjustable Parameters

**Debounce Delay** (in `StorageManagement.utils.js`):
```javascript
const WRITE_DELAY = 2000; // milliseconds
```

## 🚧 Known Limitations

- **No Authentication**: Anyone can access and edit any document
- **File-Based Storage**: Not suitable for high-scale deployments
- **Simple Conflict Resolution**: Last-write-wins (no operational transforms)
- **No Version History**: Previous document states are not tracked
- **Ephemeral on Free Hosting**: Files are lost on Render free tier restarts

## 🔮 Future Enhancements

- [ ] User authentication with JWT
- [ ] Document ownership and permissions
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Operational Transforms or CRDTs for better conflict resolution
- [ ] Version history and rollback functionality
- [ ] Rich text editing support
- [ ] Presence indicators (show active users)
- [ ] Document sharing via links
- [ ] Export documents (PDF, Markdown, etc.)
- [ ] Search functionality across documents

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Socket.io for WebSocket implementation
- Express.js for REST API framework
- The Node.js community for excellent documentation

---

⭐ If you found this project helpful, please consider giving it a star!