const mongoose = require('mongoose');

const BootcampSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim,
        maxlength: [50, 'Name can be more than 50 characters']
    },

    user : {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    careers: {
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'Ios Development',
            'UI/UX',
            'Data Science',
            'Artifical Intelligence'        ]
    },
    averageRating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },

    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters']
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS'
      ]
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    }
},{ timestamps: true}, { toJSON: {virtuals:true}, toObject:{virtuals: true}}
)

//  Cascade delete courses when a bootcamp is deleted !
BootcampSchema.pre('remove', async function (next) {
    console.log(`Courses being removed from bootcamp ${this._id}`);
    await this.model('Course').deleteMany({bootcamp: this_id});
    next();
    
})

// Reverse populate with virtuals
BootcampSchema.virtuals('courses', {
    ref:'Course',
    localFied: '_id',
    foreignField:'bootcamp',
    justOne: false
});

module.exports = mongoose.model('Bootcamp', BootcampSchema);