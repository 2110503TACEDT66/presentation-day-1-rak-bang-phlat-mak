const Customer = require('../models/Customer');

//@desc     token response
//@route    POST /api/v1/auth/register and login
//@access   public
const sendTokenResponse = (user, StatusCode, res) => {
    //create Token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res.status(StatusCode).cookie('token', token, options).json({
        success: true,
        token
    });
}

//@desc     Register customer
//@route    GET /api/v1/auth/register
//@access   Public
exports.register = async (req,res,next) => {
    try {
        const {name, tel, email, role, password} = req.body;

        //Create user
        const user = await Customer.create({
            name, 
            tel,
            email,
            password,
            role
        });

        //Get signed JWT Token
        // const token = user.getSignedJwtToken();
        // res.status(200).json({success: true, token});
        sendTokenResponse(user,200,res);
    } catch (err) {
        res.status(400).json({success:false});
        console.log(err.stack);
    }
}

//@Desc     login for
//@route    POST /api/v1/auth/login
exports.login = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        //Validate email & password
        if (!email || !password) {
            return res.status(400).json({success:false,
            msg: "Please provicde an email and password"});
        }

        //Check for user
        const user = await Customer.findOne({email}).select('+password');
        if (!user) {
            return res.status(400).json({success: false, msg: 'Invalid credentials'});
        }

        //Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({success:false,
            msg: 'Invalid credentials'});
        }

        //Create token
        // const token = user.getSignedJwtToken();
        // res.status(200).json({success: true, token});
        sendTokenResponse(user,200,res);
    } catch (error) {
        console.log(error);
        res.status(500).json({successs: false, msg: "It looks like you are attempting to do an sql injection."});
    }
}

//Get all users
exports.getUsers = async (req, res, next) => {
    try {
        const users = await Customer.find();
        res.status(200).json({
            success: true,
            count: users.length, 
            data: users
        })
    } catch (err) {
        res.status(400).json({success: false});
    }
}

//@Desc     get current logged in user
//@Route    POST /api/v1/auth/me
//@Access   private
exports.getMe = async (req, res, next) => {
    const user = await Customer.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
};

//@desc    Log user out / clear cookie
//@route   GET /api/v1/auth/logout
//@access  Private
exports.logout = async(req,res,next) => {

    //Clears cookie
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10*1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
};