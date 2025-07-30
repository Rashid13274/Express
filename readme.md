# WebSocket Demo Project

This project demonstrates the fundamentals of WebSocket technology using Node.js, Express, and the `ws` library. It shows how to establish persistent bidirectional communication between a client and server.

## Table of Contents
- [What are WebSockets?](#what-are-websockets)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Testing Methods](#testing-methods)
- [Key Features](#key-features)
- [How WebSockets Work](#how-websockets-work)
- [Use Cases](#use-cases)

## What are WebSockets?
WebSockets provide a persistent, full-duplex communication channel over a single TCP connection. Unlike HTTP's request-response model:
- Maintains an open connection between client and server
- Enables real-time data transfer
- Low latency communication
- Both client and server can initiate messages
- Efficient for frequent data exchanges

## Project Structure
```
websocket-demo/
├── server.js             # Express server with WebSocket integration
├── public/               # Client-side files
│   └── index.html        # WebSocket test client
├── package.json          # Project dependencies
└── README.md             # This documentation
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/websocket-demo.git
cd websocket-demo
```

2. Install dependencies:
```bash
npm install
```

## Usage

Start the server:
```bash
node server.js
```

You should see:
```
HTTP server running on port 3000
```

Access the client interface at:  
http://localhost:3000

## Testing Methods

### 1. Browser Client
1. Open http://localhost:3000
2. Observe the connection message
3. Send messages using the input field
4. See messages echoed from the server

### 2. Command Line Testing (using wscat)
Install wscat:
```bash
npm install -g wscat
```

Connect to the server:
```bash
wscat -c ws://localhost:3000
```

Example session:
```text
Connected (press CTRL+C to quit)
< {"type":"welcome","message":"Connected to WebSocket server!"}
> Hello Server
< {"type":"echo","message":"Server received: Hello Server"}
```

### 3. Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to Network → WS tab
3. Inspect:
   - Frames (sent/received)
   - Connection handshake
   - Message timing

### 4. Automated Tests (Jest Example)
Create `server.test.js`:
```javascript
const WebSocket = require('ws');

describe('WebSocket Server', () => {
  let ws;
  
  beforeAll((done) => {
    // Start server in test environment
    require('./server');
    ws = new WebSocket('ws://localhost:3000');
    ws.on('open', done);
  });

  afterAll(() => {
    ws.close();
  });

  test('receives welcome message', (done) => {
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      expect(msg.type).toBe('welcome');
      done();
    });
  });

  test('echoes messages', (done) => {
    const testMessage = 'Jest test message';
    ws.send(testMessage);
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if(msg.type === 'echo') {
        expect(msg.message).toContain(testMessage);
        done();
      }
    });
  });
});
```

Run tests:
```bash
npm install --save-dev jest
npx jest server.test.js
```

## Key Features
- ✅ WebSocket connection establishment
- ✅ Bidirectional communication
- ✅ Connection lifecycle handling
- ✅ Message broadcasting to all clients
- ✅ JSON message formatting
- ✅ Automatic reconnection handling
- ✅ Client-server echo demonstration

## How WebSockets Work
1. **Handshake**: Client initiates connection with HTTP upgrade request
   ```http
   GET / HTTP/1.1
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
   ```
   
2. **Server Upgrade**: Server responds with upgrade confirmation
   ```http
   HTTP/1.1 101 Switching Protocols
   Upgrade: websocket
   Connection: Upgrade
   Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
   ```

3. **Persistent Connection**: TCP connection remains open after handshake

4. **Data Frames**: Messages are sent as frames (not whole messages)
   - Can be text or binary data
   - Can be fragmented across multiple frames

5. **Heartbeats**: Optional ping/pong frames to keep connection alive

6. **Closure**: Either party can initiate graceful close handshake

## Use Cases
- Real-time chat applications
- Live data dashboards (stocks, sports)
- Collaborative editing tools
- Multiplayer online games
- IoT device monitoring
- Live location tracking
- Real-time notifications
- Financial trading platforms

This project demonstrates the core WebSocket workflow in a minimal implementation.