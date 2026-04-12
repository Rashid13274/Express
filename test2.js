/***
 * a simple express application using jwt. with authentication and authorization 
 * also encrypt the password.
 * user table
 * task table
 * once user deletes it's account all associate task must gets deleted.
 * filter task the task by name and  date,
 * apply pagination in task.
 *  */ 

const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
// const bcrypt = require('bcrypts');
const bcrypt = require('bcryptjs');

// const ErrorResponse = require('./ErrorResponse');
const ErrorResponse = require('./utlis/errorResponse');

mongoose.connect(`mongodb://localhost:27017/test`)
.then(() => console.log(`mongodb is connected`))
.catch((error) => console.log(`something went during mongodb connection ${error.message}`));

const app = express();
app.use(express.json());

const UserSchema = new mongoose.Schema({
    email :{
        type:String,
        required: [true, 'please enter the email'],
        trim: true,
        unique: true,
        lowercase:true
    },
    password : {
        type: String,
        required:[true, 'Please enter the password'],
        minlength: 6, 
        select: false
    },
    name: {
        type: String,
        required: [true, 'Please enter the name'],
        trim: true
    },

    roles: {
        type: String,
        enum : ['user', 'admin'],
        default: 'user'
    }
}, {timestaps: true });

//  password hashing middleware
UserSchema.pre('save', async function(next){
    // only hash if password is modified.
    if(!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
})
/***
 * Cascade delete means: when you delete a parent record,
 * all its related child records should also be deleted automatically.
 * otherwise, you’ll have orphaned course documents in the database.
 */
UserSchema.pre('remove', async function (next) {
    console.log(`Task is being deleted from Database ${this._id}`);
    await this.model('Task').deleteMany({user: this._id});
    next();
})

// Password comparison method
UserSchema.methods.passwordCompare =  async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// get the jwt token
UserSchema.methods.getJWTtoken = function(){
    return jwt.sign({id : this._id}, process.env.JWT_SECRET, {
        expiresIn: '6h'
    })
}

const User = mongoose.model('User', UserSchema);

//  Task Schema.
const TaskSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "please enter the name of task"]
    }, 
    description: {
        type: String,
        trim: true,
        required: [true, 'Please the description of task']
    },

    user : {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true});

const Task = mongoose.model('Task', TaskSchema);


// JWT Authentication Middleware
const authenticateToken =  async (req, res, next) =>{
    let token ;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    if(!token){
        return next(new ErrorResponse('Not authorized to access this route ', 401));
    }

    try {
        // verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
        
    }
    
}

const authorize = (...roles) =>{
        return (req, res, next) =>{
            if(!roles.includes(req.user.role)){
                return next(new ErrorResponse(`User role ${req.user.role} is not authorized to access this rote`, 403));
            }
         next();
    }
}

app.get('/getme', async(req, res, next) =>{
    try {
        res.status(200).json({success: true, message: 'successfully get request executed !!!'});
    } catch (error) {
        return next(new ErrorResponse(`something went wrong : error: ${error.message}`, 500 ));
        
    }
})

app.post('/register', async(req, res, next) =>{
    try {
        const user  = await User.create(req.body);
        res.status(201).json({success: true,  data: user});
    } catch (error) {
        return next(new ErrorResponse(`somewent wrong while creating user error: ${error.message}`, 500));
    }
});

app.post('/sign', async(req, res, next) =>{
    try {
        const {email , password} = req.body;
    if(!email || !password){
        return next(new ErrorResponse('somewent wrong while siggn ', 500));
    }
    const user  = await User.findOne({email}).select('+password');
    if(!user){
        return next(new ErrorResponse('user not found ', 404));
    }
    //  check the correct password entered by user.
    const isValidPassword = await user.passwordCompare(password);
    if(!isValidPassword){
        return next(new ErrorResponse('invalid password ', 401));
    }
    const token  = user.getJWTtoken();
    res.status(200).json({success:true, token}) 
    } catch (error) {
        return next(new ErrorResponse(`login error ${error.message}`, 500));
    }
});

app.get('/user/:userId', authenticateToken, async(req,res) =>{
    const id = req.params.id;
    const user = await User.findById(id);
    if(!user){
        return next(new ErrorResponse(error.message, 500));
    }
    res.status(200).json({success: true, data: user});
});

app.put('/user/:userId', authenticateToken, async(req, res) =>{
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runvalidators: true
    })
    res.status(200).json({success: true, data: user});
});

app.delete('/user/:userId', authenticateToken, async(req, res) =>{
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({success: true, data: user});
});

//  Only the admin can create the task. 
app.post('/task', authenticateToken, authorize('admin'), async(req, res, next) =>{
    // req.body.user = req.user.id;
    try {
        // if admin  -> accept array of tasks
        if(req.user.role === 'admin'){
            const tasks = req.body.tasks;
            if(!Array.isArray(tasks)){
                next(new ErrorResponse('Tasks must be an array for admin', 400));
            }
            const taskWithUser = tasks.map(task =>({...task, user: req.user.id}));
            const createdTasks = await Task.insertMany(taskWithUser);

        return res.status(201).json({
        success: true,
        count: createdTasks.length,
        data: createdTasks
            })
        }

        // if normal user → only one task
    if (req.user.role === "user") {
      const { name, description } = req.body;

      if (!name || !description) {
        return res.status(400).json({ success: false, message: "Name and description are required" });
      }

      const task = await Task.create({
        name,
        description,
        user: req.user.id
      });

      return res.status(201).json({ success: true, data: task });
    }
    } catch (error) {
        next(new ErrorResponse('Not authorized', 403));
    }
})

app.listen(3000, console.log('server is listening on port 3000'));

// not authorize -> 403,
// not authenticated -> 401