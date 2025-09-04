const express = require('express');
const { addReview } = require('../controller/review');

const router = express.Router({ mergeParams: true });

const {protect, authorize} = require('../middleware/auth');

router
  .route('/')
  .post(protect, authorize('user', 'admin'), addReview);
module.exports = router;
