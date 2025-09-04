const express = require('express');
const {addCourse, getCourse} = require('../controller/course');

const Course = require('../models/Course');

const router = express.Router();
const {protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('publisher', 'admin', addCourse));

router.get('/:id',  getCourse);

module.exports = router;

