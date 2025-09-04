const asyncHandler = require("../middleware/async");
const ErrorResponse = require('../utlis/errorResponse');
const User = require('../models/User');

// @desc      Create user
// @route     POST /api/v1/auth/users
// @access    Private/Admin
exports.createUser = asyncHandler(async(req, res, next) =>{
    const user = await User.create(req.body);
    res.status(201).json({success: true, data: user});
})


// @desc      Update user
// @route     PUT /api/v1/auth/users/:id
// @access    Private/Admin

exports.updateUser = asyncHandler(async(req, res, next) =>{
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true
    })

    res.status(200).json({success : true, data: user});
})

// @desc      Delete user
// @route     DELETE /api/v1/auth/users/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async(req, res, next) =>{
    const user = await User.findByIdAndDelete(req.params.id);

    res.status(200).json({success: true, data: user});
})


// @desc      Get single user
// @route     GET /api/v1/auth/users/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async(req, res, next) =>{
    const user = await User.findById(req.params.id);
    res.status(200).json({success: true, data: user});
})


// @desc      Get all users
// @route     GET /api/v1/auth/users
// @access    Private/Admin
exports.getUsers = asyncHandler(async(req, res, next ) =>{

    // 1️⃣ Create a copy of  req.query (to avoid modifying original)
    const queryObj = {...req.query};
    // Fields to exclude from filtering (pagination , sorting , etc)
    const excludeFields  = ['page', 'limit'];
    excludeFields.forEach(param => delete queryObj[param]);

    //  Create a filter Object for mongoose
    let filter = {};
    // Name filtering (case-insensative)
    if(queryObj.name){
        filter.name = {$regex: queryObj.name, $options: 'i' };
    }

    // Name filtering (case-insensative)
    if(queryObj.email){
        filter.email = {$regex:queryObj.email , $options: 'i'};
    }

    //  Role filtering (exact match)
    if(queryObj.role){
        filter.role = queryObj.role;
    }

    //  pagination
    const page = parseInt(req.query.page , 10) || 1;  // default page 1.
    const limit = parseInt(req.query.limit, 10) || 10;  // default 10 users per page
    const skip   = (page - 1) * limit;

    //  Query the database
    const users = await User.find(filter).skip(skip).limit(limit).select('-password'); // Exclude the password field.

    //  Count the total documents (for pagination info)
    
    const total = await  User.countDocuments(filter);

    res.status(200).json({
        success: true,
        count : users.length,
        page,
        totalPage: Math.ceil(total / limit),
        data: users
    })
})
