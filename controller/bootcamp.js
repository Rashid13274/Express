const path = require('path');
const ErrorResponse  = require('../utlis/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private

exports.createBootcamp = asyncHandler(async(req, res, next) =>{
    //  add user to req.body
    req.body.user = req.user.id;

    //  check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({user: req.user.id});

    //  if the user is not admin , they can only add one bootcamp
    if(publishedBootcamp && req.user.role !== 'admin'){
        return next (new ErrorResponse(`The user with Id ${req.user.id} has already published the bootcamp`))
    }

    const bootcamp  = await Bootcamp.create(req.body);

    res.status(200).json({
        success: true,
        data: bootcamp
    })
})

// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async(req, res, next) =>{
    let bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    //  Make sure user is bootcamp owner.
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next (new ErrorResponse(`User ${req.params.id} is not authorized to update this bootcamp`,
        401));
    };

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new : true, runValidators: true
    } )

    res.status(200).json({success: true, data: bootcamp });
})


// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async(req, res, next) =>{
    const bootcamp = await Bootcamp.findById(req.params.id);
    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    //  Make sure user is bootcamp owner
    if(bootcamp.user !== req.user.id && req.user.role !== 'admin' ){
        return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to delete this bootcamp`,
        401
      )
    );
    }

    bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
    res.status(200).json({success: true, data: bootcamp});
})


// @desc      Upload photo for bootcamp
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private

exports.bootcampPhotoUpload = asyncHandler(async(req, res, next) =>{
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.params.id} is not authorized to update this bootcamp`,
        401
      )
    );
  }

  if(!req.files){
    return next(new ErrorResponse(`Please upload a file `, 400));
  }

  const file = req.files.file;

//   Make sure image is photo
if(!file.mimetype.startsWith('image')){
    return next(new ErrorResponse(`Please upload an image file`, 400));
}

// check file size 
if(file.size  > process.env.MAX_FILE_UPLOAD){
    return next(new ErrorResponse(`Please upload an image less than the size of ${process.env.MAX_FILE_UPLOAD} `));
}

//  create  custom filename
file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err =>{
    if(err){
        console.log(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
    }
})

bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, {photo: file.name} )

res.status(200).json({success: true, data: file.name});

})