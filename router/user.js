const express  = require('express');
const {
    createUser,
    getUser,
    getUsers,
    updateUser,
    deleteUser
}
= require('../controller/user');

const router = express.Router();

const User = require('../models/User');

const { protect, authorize} = require('../middleware/auth');
const { route } = require('./auth');

router.use(protect);
router.use(authorize('admin'));

router
route('/')
.get(getUsers )
.post(createUser);

router
route('/:id')
.get(getUser)
.put(updateUser)
.delete(deleteUser)

module.exports = router;