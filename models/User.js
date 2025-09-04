const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserSchema = mongoose.Schema({
    name : {
        type: String,
        required: [true, 'please user name']
    },
    password : {
        type: String, 
        required:[true, 'please enter the password'],
        select: false,
        minlength: 6
    },
    role : {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    email: {
        type: String,
        unique: true,
        match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
        ]
    },
    resetPasswordToken: String,
    resPasswordTokenExpire: String
}, { timestamps: true});

// Encrypt the password using bcrypt.
UserSchema.pre('save', async function (next) {
    if(!this.isModified('password')){
        next();
    }
    const salt = bcrypt.genSalt(10);
    this.password = bcrypt.hash(this.password, salt);
})


//  sign the jwt and return the token
UserSchema.methods.getJwtSignedToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET,
         {expiresIn: process.env.JWT_EXPIRE});
}

// Match user entered password to hashed password in database
UserSchema.methods.matchPasword =  async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

//  ========== forgot password functionality ================ //
UserSchema.methods.generateResetPasswordToken = function(){
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');
    // Hash the token  and set to resetPasswordToken field.
    this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

    this.resPasswordTokenExpire = Date.now() + 10 * 60 + 1000;

    return resetToken;
}

module.exports = mongoose.model('User', UserSchema);