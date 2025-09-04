const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utlis/errorResponse');
const User = require('../models');


// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register  = asyncHandler(async(req, res, next) =>{
    const { name, email, password, role} = req.body;

    //  create user
    const user = await User.create({name, email, password, role});

    sendTokenResponse(user, 200, res);
})

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public

exports.login = asyncHandler(async(req, res, next) =>{
    const {email, password} = req.body;
    
    // validate email
    const user = await User.findOne({email});
    if(!user){
        return next(new ErrorResponse('invalid email', 401))
    }

    // check the password
    const isValidPassword = user.matchPasword(password);
    if(!isValidPassword){
        return next(new ErrorResponse('invalid pasword', 401))
    }
    sendTokenResponse(user, 200, res);
})

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private

exports.logout = asyncHandler(async(req, res, next) =>{
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    
    res.status(200).json({success: true, data: {}});
})

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private

exports.getMe = asyncHandler(async(req, res, next) =>{
    const user = await User.findById(req.user.id);
    res.status(200).json({success: true, data:user});
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async(req, res, next) =>{
    const user  = await User.findById(req.user.id);
    
    // check the current password
    if(!(await user.matchPasword(req.body.password))){
    return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
})

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async(req, res,next) =>{
    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorResponse('Invalid credentials', 401))
    }
    // Get the reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave: false});

    // create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpasword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    try{
        await sendEmail({email: user.email, subject: 'password reset token', message})
    }
    catch(err){
        console.log(err);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave: false});
        return next( new ErrorResponse('Email could not be sent', 500))
    }

    res.status(200).json({
        success: true,
        data:user
    })
})


// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public

exports.resetPassword = asyncHandler(async(req, res, next ) =>{
    // Get Hashed token 
    const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hext');

    const user = await findOne({resetPasswordToken,
        resPasswordTokenExpire: { $gt : Date.now()}
    })

    if(!user){
        return next(new ErrorResponse('invalid token', 500));
    }
    
    // set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resPasswordTokenExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);
})
    
// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) =>{
    // create token
    const token = user.getJwtSignedToken();
    
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    res
    .status(statusCode)
    .cookie('token', token, options)
    .json({success: true, token});
}