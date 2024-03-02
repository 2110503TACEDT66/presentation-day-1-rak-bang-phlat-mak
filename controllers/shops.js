const Shop = require('../models/Shop.js');

//@desc     GET all shops
//@route    GET /api/v1/shops
//@access   PUBLIC
exports.getShops = async (req,res,next) => {
    let query;

    // Copy req.query
    const reqQuery = {...req.query};

    //Fields to exclude
    const removeFields = ['select','sort','page','limit'];

    //Loop each fields and then delete from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`);
    query = Shop.find(JSON.parse(queryStr)).populate('reservations');

    //Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //Sort fields
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('name');
    }

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt (req.query.limit, 10) || 25;
    const startIndex = (page-1) * limit;
    const endIndex = page * limit;
    const total = await Shop.countDocuments();

    query = query.skip(startIndex).limit(limit);

    //Executing query
    try {
        const shops = await query;

        //Pagination result
        const pagination = {};
        if (endIndex < total) {
            pagination.next = {
                page: page+1,
                limit
            }
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page-1,
                limit
            }
        }

        res.status(200).json({success:true, 
            count:shops.length,
            pagination,
            data: shops});
    } catch (err) {
        res.status(400).json({success: false});
    }
};

//@desc GET specific shop
//@route GET /api/v1/shop/:id
//@access PUBLIC
exports.getShop = async (req,res,next) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (!shop) {
            res.status(400).json({success: false, message: "There is no such shop."});
        }

        res.status(200).json({
            success:true, 
            data: shop});
    } catch (err) {
        res.status(400).json({success: false});
    }
};


//@desc     CREATE new shop
//@route    POST /api/v1/shops
//@access   PRIVATE
exports.createShop = async (req,res,next) => {
    const shop = await Shop.create(req.body);
    res.status(201).json({
        success: true,
        msg: 'Created a new shop',
        data: shop
    });
};

//@desc     UPDATE a shop
//@route    POST /api/v1/shops
//@access   PRIVATE
exports.updateShop = async (req,res,next) => {
    try {    
        const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!shop) {
            res.status(400).json({success: false});
        }

        res.status(400).json({
            success: true,
            data: shop});
    } catch (error) {
        res.status(400).json({success: false});
    }
};

//@desc     DELETE a shop
//@route    DELETE /api/v1/shops/:shopID
//@access   PRIVATE
exports.deleteShop = async (req, res, next) => {
    try {
        const shop = await Shop.findById(req.params.id);

        if (!shop) {
            res.status(400).json({success: false, msg: "There is no such shop."});
        }

        await shop.deleteOne();
        res.status(200).json({success: true, msg: `${shop.name} has been deleted`});
    } catch (error) {
        res.status(400).json({success: false});
    }
};