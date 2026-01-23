const express = require('express');
const bcrypt = require('bcryptjs');
const jwt  = require('jsonwebtoken');

const users  = [   
    {
        name: 'john-wick',
        email: 'john@email.com',
        password: bcrypt.hashSync('123456', 10),
        otp: null,
        otpExpire: null,
        accountLockedUntil: null,
        failedAttempts: 0
    }
]
const JWT_SECRET = 'SHSHJ234@@JKDSJ';

const authenticate = async (req, res,  next) =>{
    let token;
    if(req.headers && req.headers.authorization){
        if(req.headers.authorization.startsWith('Bearer')){
            token  = req.headers.authorization.split(' ')[1];
        }
    }
    const decode = jwt.verify(token, JWT_SECRET);
    

}

const app = express();
app.use(express.json());

app.post('/register', async (req, res) =>{
    try {
    const {name, email, password} = req.body;
    // check user already exist.
    const is_user_exist = users.findIndex((user) =>user.email == email);
    if(is_user_exist){
        return res.status(400).json({success: false, msg: 'user already exist.'});
    }
    //  encrypt the password.
    const salt = bcrypt.gensalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    const user = 
    {
        name, 
        email, 
        encryptedPassword, 
        otp: null,
        otpExpire: null,
        accountLockedUntil: null,
        failedAttempts: 0
    };
    users.push(user);
        return res.status(201).json({success: false, data: users});

    } catch (error) {
        return res.status(500).json({success: false, msg: 'Internal Server Error'});
    }
})

app.post('/login', async(req, res) =>{
    try {
        const {email, password} = req.body;
        
    // check user already exist.
    const user = users.find((user) =>user.email == email);

    if(!user){
        res.status(400).json({success: false, msg: 'please enter the correct email'});
    }
    // check password  is correct or not.
    const is_pasword_right = await bcrypt.compare(password, users[is_user_exist].password);
    if(!is_pasword_right){
        return res.status(400).json({success: false, msg: 'user password is not matched.'});
    }

    // check account is not locked and send the otp.
    if(user && user.accountLockedUntil >= Date.now()){
        return res.status(400).json({success: false, msg: 'please try sometimes later.'});
    }

    user.otp = Math.floor(1000 + Math.random() * 9000);
    user.otpExpire = Date.now() + 40 * 1000; // 40 second.
    return res.status(200).json({success: true, data: user.otp});
    } catch (error) {
        return res.status(500).json({success: false, msg: error.message});
    }
})

app.post('/verify-otp', async(req, res) =>{
    try {
        const {email, otp } = req.body;
        // check otp is correct.
        const user = users.find((element) => element.email == email);
        if(user &&  user.accountLockedUntil >= Date.now()){
            return res.status(400).json({success: false, msg: `you're acccount is locked please try again !}`});
        }

        if(user  &&  user.otpExpire <= Date.now()){
            return res.status(400).json({success: false, msg: `you're otp has been expired please login again.}`});
        }

        if(user && user.otp == otp){
            user.otp = null;
            user.otpExpire = null;
            user.accountLockedUntil = null;
            user.failedAttempts  = 0;
            const token = jwt.sign({email: user.email}, JWT_SECRET, {expiresIn: '1h'} );
            return res.status(400).json({success: true, data: token});
        }
        else{
            user.failedAttempts += 1;
        }


        if(user. user.failedAttempts >= 3){
            user.accountLockedUntil = Date.now() + 3 * 60 * 1000;
            return res.status(400).json({success:false, msg: `you tried multiple failed attempts, and you're account is  locked for 3 min.` });
        }

    } catch (error) {
        return res.status(500).json({success: true, msg: error.message});
        
    }
})


