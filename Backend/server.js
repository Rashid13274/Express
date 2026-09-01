const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({path: path.join(__dirname, '../.env')});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Database connection
require('./config/db')();

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// API Routes
app.use('/api', require('./routes/api'));


// Socket.IO events
require('./socket/events')(io);

// ✅ 👇 Place this here LAST (after static and API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});