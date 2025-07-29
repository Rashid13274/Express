const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'please enter username']
    },

    password: {
        type: String,
        required:[true, 'please enter password'],
    }
}, { timestamps: true}
)


module.exports = mongoose.model('User', UserSchema);