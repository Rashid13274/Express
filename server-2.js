// ======================== USER AUTHENTICATION SYSTEM ========================
// This application implements a secure authentication system with:
// 1. USER REGISTRATION - Create new user accounts with hashed passwords
// 2. LOGIN - Verify email & password, then send OTP for additional security
// 3. OTP VERIFICATION - Verify one-time password and generate JWT token
// 4. TOKEN-BASED AUTH - Use JWT token to access protected routes
// 5. ACCOUNT LOCKOUT - Lock account after 3 failed OTP attempts for 3 minutes
//
// Flow: Register → Login (get OTP) → Verify OTP (get Token) → Access Protected Routes
// =============================================================================

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const users = [];
const JWT_SECRET = 'RANDOMBYTE321@123';

const app = express()
app.use(express.json());

// ======================== MIDDLEWARE: Verify JWT Token ========================
// This middleware checks if a valid JWT token is provided in the request header
// Format: Authorization: Bearer <token>
// If token is valid, attach user data to req.user and allow access
// If token is missing or invalid, reject request with 401 status
// =============================================================================
const verifyToken = (req, res, next) => {
    try {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({success: false, msg: `No token provided `});
    }
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({success: false, msg: 'Invalid or expired token'});
    }
};

// ======================== ROUTE: POST /register ========================
// Registers a new user with email and password
// Steps:
// 1. Check if user already exists (prevent duplicates)
// 2. Hash the password using bcryptjs (10 salt rounds for security)
// 3. Initialize OTP fields as null (will be set during login)
// 4. Initialize account lock fields (for failed OTP attempts)
// 5. Save user to database
// =======================================================================
app.post('/register', async(req, res) =>{
    try {
        let body = req.body;
        //  ensure user already exist.
        const user = users.find((ele) => ele.email == body.email);
        if(user){
            return res.status(400).json({success: false, msg: 'users already exist.'});
        }else{
            req.body.otp = null;
            req.body.otpExpire = null;
            req.body.accountLockedUntil = null;
            req.body.failedAttemp = 0
        }
        const password  = bcrypt.hashSync(req.body.password, 10);
        req.body.password = password;
        users.push(body)
        res.status(201).json({success: true, data: users})
        
    } catch (error) {
        res.status(500).json({success: false, msg: error.message});
        
    }
})

// ======================== ROUTE: POST /login ========================
// Authenticates user and sends OTP via console (in real app, send via email/SMS)
// Steps:
// 1. Verify email exists in database
// 2. Verify password matches using bcryptjs.compareSync()
// 3. Check if account is locked (after 3 failed OTP attempts)
// 4. Generate random 4-digit OTP
// 5. Set OTP expiry to 2 minutes from now
// 6. Return OTP (console logged for development purposes)
// =====================================================================
app.post('/login', async(req, res) =>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user  = users.find((ele) => ele.email == email);
        if(!user){
            return res.status(404).json({success: false, msg: 'User does not exist'})
        }
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, user.password);
        if(!isPasswordCorrect){
            return res.status(404).json({success: false, msg: 'password is not correct '})
        }

        //  check account is locked or not.
        if(user.accountLockedUntil && user.accountLockedUntil > Date.now()){
            return res.status(400).json({success: false, msg: `account is locked Until ${new Date.now(user.accountLockedUntil).toLocaleTimeString()}`});
        }

        //  Generate 4 digit otp and set the expiry time for otp.
        const otp = Math.floor(1000 +  Math.random() * 9000).toString();
        user.otp = otp;
        user.otpExpire = Date.now() + 2 * 60 * 1000 // 2 min;
        user.failedAttemp = 0
        
        console.log(`OTP sent for User ${user.email} and OTP ${otp}`);
        res.status(200).json({success: true, data: `OTP : ${otp}`});
    } catch (error) {
        res.status(500).json({success: false, msg: error.message});
        
    }
})

// ======================== ROUTE: POST /verify-otp ========================
// Verifies the OTP and generates JWT token for authentication
// Steps:
// 1. Check if account is locked (locked for 3 minutes after 3 failed attempts)
// 2. Check if OTP exists and hasn't expired (2-minute window)
// 3. Verify OTP matches the value sent during login
// 4. If correct: Clear OTP, generate JWT token (expires in 1 hour), return token
// 5. If incorrect: Increment failed attempts counter
// 6. If 3 failed attempts: Lock account for 3 minutes
// ========================================================================
    app.post('/verify-otp', async(req, res) =>{
        try{
            const {email, otp}  = req.body;


            //  check whether it matches or not
            const user = users.find((element) => element.email == email);

            //  check whether otp  has expired or not. 
            if( !user.otp || user.otpExpire  < Date.now()){
                return res.status(400).json({success: false, message: 'otp has expired  please try again'});
            }

            if( user.accountLockedUntil && user.accountLockedUntil > Date.now() ){
                return res.status(400).json({success: false, message : `Account locked Until ${new Date(user.accountLockedUntil).toLocaleTimeString()}` })
            }

            const token  = jwt.sign({email: user.email, name: user.name}, JWT_SECRET, {expiresIn:'1h'});
            
            if(user && user.otp == otp){
                user.otp  = null;
                user.failedAttempts = 0;
                user.accountLockedUntil = null;
                user.otpExpire = null;
                return res.status(200).json({success: true, data :  token});
            }
            
            failedAttempts += 1;
            if(user.failedAttempts >= 3){
                user.accountLockedUntil = Date.now() + 3* 60 * 1000 // 3 min
            }

            return res.status(404).json({success: false, message: 'incorrect otp ! please try again'})

        }catch(err){
            return res.status(500).json({success: false, message: err.message});
        }
    })


// ======================== ROUTE: GET /profile ========================
// Protected route - requires valid JWT token
// Returns user information extracted from the JWT token
// Access: Send request with header: Authorization: Bearer <token>
// ====================================================================
// Protected route - requires valid token
app.get('/profile', verifyToken, (req, res) => {
    res.status(200).json({success: true, msg: 'Profile accessed', user: req.user});
})

// ======================== ROUTE: GET /me ========================
// Protected route - requires valid JWT token
// Returns detailed user information from the database
// Uses email from JWT token to find and return user details
// Access: Send request with header: Authorization: Bearer <token>
// ================================================================
app.get('/me', verifyToken, (req, res) =>{
    const user = users.find((ele) => ele.email = req.user.email);
    res.status(200).json({success: true, msg: `user with email ${user.email} have accessed the route /me` })
})

// ======================== START SERVER ========================
// Server listens on port 3000
// ============================================================
app.listen(3000, () => console.log('server is listening on localhost:3000'));

