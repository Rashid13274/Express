const express = require('express');
const router = express.Router();
const {
    uploadSingleFile,
    uploadMultipleFiles,
    customRateLimitTest
}  = require('../controller.js/multer')

const multerConfig =  require('../middleware/multer-config');
const customRateLimiter = require('../middleware/custom-ratelimit');


/* 
POST http://localhost:3000/api/uploads/single
Form-data: Key: `myImage`, Value: (select an image file)

POST http://localhost:3000/api/uploads/multiple
Form-data: Key: `myImages`, Value: (select multiple image files)
*/

// Single file upload route
router.post('/single', multerConfig.single('myImage'), uploadSingleFile);

// Multiple file upload route
router.post('/multiple', multerConfig.array('myImages', 3), uploadMultipleFiles);


// test rate-limit
router.get('/ratelimit', customRateLimiter ,customRateLimitTest)
module.exports = router;

