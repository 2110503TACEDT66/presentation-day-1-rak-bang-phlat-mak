const express = require('express');
const dotenv = require('dotenv');
dotenv.config({path:'./config/config.env'});
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
// Security middlewares
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
// http params pollution preventer
const hpp = require('hpp');
// CORS
const cors = require('cors');

//====Routes======//
const shops = require('./routes/shops');
const auth = require('./routes/auth');
const reservations = require('./routes/reservations');




// connect to Database
connectDB();

const app = express();
app.use(express.json());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

const limiter = rateLimit({
    windowsMs: 10*60*1000,
    max: 1000
});
app.use(limiter);

app.use(hpp());
app.use(cors());

//=====Models======//
app.use('/api/v1/shops', shops);
app.use('/api/v1/auth', auth);
app.use('/api/v1/reservations', reservations);
app.use(cookieParser);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, 'on' + process.env.HOST + ":" + PORT));

// Handle unhandled promise rejections
process.on(`unhandledRejection`, (err,promise)=>{
    console.log(`Error: ${err.message}`);
    
    //Close server & exit process
    server.close(() => process.exit(1));
});