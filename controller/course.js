const Course = require('../models/Course');
const asyncHandler  =  require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utlis/errorResponse');


// @desc      Add course
// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @access    Private

exports.addCourse = asyncHandler(async(req, res, next) =>{
    //  add user and bootcamp  to course.
    req.body.bootcamp = req.params.bootcampId;
    req.body.user =  req.user.id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp){
        return next(new ErrorResponse(`No bootcamp exist with the ID ${req.params.bootcampId}`, 404));
    }

    // Make sure user is bootcamp owener
    if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin' ){
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`,
        401))
    }

    const course = await Course.create(req.body);
    res.status(201).json({success: true, data: course});
})

// @desc      Get single course
// @route     GET /api/v1/courses/:id
// @access    Public
exports.getCourse = asyncHandler(async(req, res, next) =>{
    const course = await Course.findById(req.params.id).populate({
        path:'bootcamp',
        select: 'name description'
    })

    if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }

  res.status(200).json({
    success: true,
    data: course
  });
})