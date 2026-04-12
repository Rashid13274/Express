/* 
## What is Middleware?
Middleware is a function that has access to the request (req), response (res), and next function.
It executes in a specific order and can:

Modify the request/response objects
End the request-response cycle
Pass control to the next middleware via next()

## const middleware = (req, res, next) => {
  // Do something with req/res
  next(); // Pass control to next middleware
}

## Middleware Execution Flow (Pipeline)
Express processes middleware in a sequential order like a pipeline:

Request
  ↓
Middleware 1
  ↓
Middleware 2
  ↓
Middleware 3
  ↓
Route Handler
  ↓
Response

=>  Critical: If you don't call next(),
    the pipeline stops and subsequent middleware won't execute.
*/

const express = require('express');
const app = express();

// ======================== GLOBAL MIDDLEWARE ========================

// 1. Logger Middleware (Similar to your logger.js)
const logger = (req, res, next) => {
    console.log(`[LOG] ${req.method} ${req.originalUrl}`);
    next(); // Pass to next middleware
};

// 2. Body Parser Middleware (built-in)
app.use(express.json());

// 3. Custom Auth Check Middleware
const checkAuth = (req, res, next) => {
    console.log('[AUTH] Checking authentication...');
    
    // Simulate checking if user is authenticated
    const token = req.headers.authorization;
    
    if (!token) {
        console.log('[AUTH] No token found');
        return res.status(401).json({ msg: 'No token provided' });
    }
    
    console.log('[AUTH] Token verified!');
    req.user = { id: 1, name: 'John' }; // Attach user to request
    next(); // Pass to next middleware
};

// 4. Timing Middleware
const timing = (req, res, next) => {
    console.log('[TIME] Request started at', new Date().toISOString());
    
    // Capture when response is sent
    res.on('finish', () => {
        console.log('[TIME] Response sent');
    });
    
    next();
};

// ======================== APPLY GLOBAL MIDDLEWARE ========================

app.use(logger);    // Applied to ALL routes
app.use(timing);    // Applied to ALL routes

// ======================== ROUTE-LEVEL MIDDLEWARE ========================

// Apply checkAuth only to specific routes
app.get('/public', (req, res) => {
    console.log('[ROUTE] Public endpoint accessed');
    res.json({ message: 'This is public' });
});

app.get('/protected', checkAuth, (req, res) => {
    console.log('[ROUTE] Protected endpoint accessed');
    res.json({ 
        message: 'This is protected', 
        user: req.user 
    });
});

// ======================== ERROR HANDLER MIDDLEWARE ========================

// Error handling middleware (Must be last!)
// Error middleware has 4 parameters: (err, req, res, next)
const errorHandler = (err, req, res, next) => {
    console.log('[ERROR] Error caught:', err.message);
    res.status(500).json({ 
        error: err.message,
        status: err.status || 500
    });
};

app.use(errorHandler);

app.listen(3000, () => console.log('Server running on :3000'));


/* 
[LOG] GET /public
[TIME] Request started at 2026-04-07T...
[ROUTE] Public endpoint accessed
[TIME] Response sent

[LOG] GET /protected
[TIME] Request started at 2026-04-07T...
[AUTH] Checking authentication...
[AUTH] Token verified!
[ROUTE] Protected endpoint accessed
[TIME] Response sent
*/