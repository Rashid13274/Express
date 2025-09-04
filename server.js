const express = require('express');
const session = require('express-session');
const app = express();
const PORT = 3000;

// Configure session middleware
app.use(session({
  secret: 'your_secret_key',  // Sign session ID cookie
  resave: false,             // Don't save session if unmodified
  saveUninitialized: false,   // Don't create session until data stored
  cookie: { 
    maxAge: 1000 * 60 * 30, // 30 minutes expiration
    httpOnly: true          // Prevent client-side JS access
  }
}));

// Home route - session counter
app.get('/', (req, res) => {
  // Initialize view count
  req.session.views = (req.session.views || 0) + 1;
  
  res.send(`
    <h1>Session Demo</h1>
    <p>View count: ${req.session.views}</p>
    <a href="/login">Login</a> | 
    <a href="/logout">Logout</a>
  `);
});

// Login route - set user session
app.get('/login', (req, res) => {
  req.session.user = { id: 123, name: 'John Doe' };
  req.session.authorized = true;
  res.send('Logged in successfully! <a href="/">Home</a>');
});

// Logout route - destroy session
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if(err) return res.send('Error logging out');
    res.send('Logged out! <a href="/">Home</a>');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});