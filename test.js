const  express =   require('express');
const  mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const fileupload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/error');

dotenv.config({path: 'config/config.env'})

//  connect to mongdb database.
// mongodb://admin:qwerty@mongo:27017/products?authSource=admin
mongoose.connect('mongodb://admin:qwerty@mongo:27017/products?authSource=admin')
.then(() => console.log(`mongodb database is connected ! `))
.catch((err) =>console.log(`some went wrong while connecting to database , error: ${err.message}`));

const app = express();

//  Routes files

const bootcamp = require('./router/auth')
const auth = require('./router/auth');
const user = require('./router/user');
const bootamp = require('./router/bootcamp');
const review = require('./router/review');
const course = require('./router/course');

// body parse
app.use(express.json());

// cookie parse
app.use(cookieParser());

// rate Limiting
const  limiter = rateLimit({
    windowMs: 10* 60 * 1000, // 10 minutes
    max: 100
})

app.use(limiter);


//  Mount routers

app.use('/api/v1/bootcamp', bootamp);
app.use('/api/v1/course', course)
app.use('/api/v1/review', review)
app.use('/api/v1/auth', auth)
app.use('/api/v1/user', user)

app.use(errorHandler);

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, () =>{
    console.log(`server is running on port ${process.env.PORT || 5000}`);
})

app.use(express.json());
app.listen()