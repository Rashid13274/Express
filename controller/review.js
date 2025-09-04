const Review = require('../models/Review');
const bootcamp  = require('../models/Bootcamp');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utlis/errorResponse');
const Bootcamp = require('../models/Bootcamp');

// @desc      Add review
// @route     POST /api/v1/bootcamps/:bootcampId/reviews
// @access    Private

exports.addReview = asyncHandler(async(req,res, next) =>{
    //  add bootcamp , user in req.body
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootamp =  await Bootcamp.findById(req.params.bootcampId);
   if (!bootcamp) {
    return next(
      new ErrorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
})

