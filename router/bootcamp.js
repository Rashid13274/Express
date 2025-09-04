const express = require('express');
const {
    createBootcamps,
    updateBootcamp,
    deleteBootcamp,
    bootcampPhotoUpload
}  = require('../controller/bootcamp');

const Bootcamp = require('../models/Bootcamp');


// Include other resourses routers
const courseRouter = require('./course');

const {protect, authorize}  = require('../middleware/auth');
const router = require('./auth');

// Re-route into other resourses routers
router.use('/:bootcampId/courses', courseRouter)

router
.route('/')
.post(protect, authorize('publisher', 'admin'), createBootcamps);


router
.route('/:id/photo')
.put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload )

router
.route('/:id')
.put(protect, authorize('publisher', 'admin', updateBootcamp))
.delete(protect,  authorize('publisher', 'admin', deleteBootcamp))

module.exports  = router;
