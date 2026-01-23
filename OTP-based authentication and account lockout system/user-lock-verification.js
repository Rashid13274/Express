const express   = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

const JWT_SECRET = 'RANDOMBYTE321@123';



const app  = express();
app.use(express.json());

app.post('/register', async(req, res) =>{
    try{
        const {name, email, password } = req.body;
        //  check user already exist ?
        const  user = users.find((element) => element.email == email);
        if(user){
            return res.status(400).json({success: false, message: 'user already exist.'});
        }
        // hashed the password.
        const hashedPassword =  bcrypt.hashSync(password, 10);

        users.push({
            name,
            email,
            password: hashedPassword,
            otp: null,
            otpExpire: null,
            failedAttempts: 0,
            accountLockedUntil: null,
        })
        return res.status(201).json({success: true, data: users})
    }
    catch(err){
        return res.status(500).json({success: false, message: err.message});
    }
})


app.post('/login', async(req, res) =>{
    try{
        const { email,  password} = req.body;
        const user = users.find((element) => element.email == email);
        if(!user){
            return res.status(404).json({success: false, message:  `user doesn't exist with the email ${email}`});
        }
        //  compare the password
        const passwordMatched = bcrypt.compareSync(password, user.password);
        if(!passwordMatched){
            return res.status(404).json({success: false, message:  `user password exist with the email ${email}`});
        }

        //  check whether account is locked or not.
        if(user.accountLockedUntil && user.accountLockedUntil > Date.now()){
            return res.status(400).json({success: false, message: `Account locked until ${new Date(user.accountLockedUntil).toLocaleTimeString()}`})
        }

        // Generate 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.otp = otp;
        user.otpExpire = Date.now() + 60 * 1000; // 1 min
        user.failedAttempts = 0;

        console.log(`OTP for ${user.email}: ${otp}`); // Simulate send via console
        return res.json({ message: 'OTP sent. Check your console.' });

    }
    catch(err){
        return res.status(500).json({success: false, message: err.message});
    }
})

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

const PORT = 3001;
app.listen(PORT, () => console.log(`server is running on port ${3001}`));


