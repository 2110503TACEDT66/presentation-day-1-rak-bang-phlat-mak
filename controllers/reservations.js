const Reservation = require('../models/Reservation');
const Shop = require('../models/Shop');

//@desc     get ALL reservations
//@route    GET /api/v1/reservations
//@access   Private

exports.getReservations = async (req,res,next) => {
    let query;
    //General users can only see their reservations

    if (req.user.role != 'admin') {
        query = Reservation.find({user:req.user.id}).populate({
            path: 'shop',
            select: 'name address tel openclose'
        });
    } else { //If you are an admin, you can see all
        if (req.params.shopID) {
            console.log(req.params.shopID);
            query = Reservation.find({hospital: req.params.shopID}).populate({
                path: 'shop',
                select: 'name address tel openclose'
            })
        } else {
        query = Reservation.find().populate({
            path: 'shop',
            select: 'name address tel openclose'
        });
        }
    }  

    try {
        const reservations = await query;

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message:'Cannot find a reservation'});
    }
};

//@desc     Get single reservation
//@route    GET /api/v1/reservations/:id
//@access   public
exports.getReservation = async (req,res,next) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate({
            path: 'shop',
            select: 'name address tel openclose'
        });

        if (!reservation) {
            return res.status(404).json({success: false, message: `No reservation with the ID of ${req.params.id}`});

        }

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({success:false, message: "Cannot find the reservation!"});
    }
};

exports.addReservation = async (req, res, next) => {
    try {
        // Add user ID to req.body
        req.body.user = req.user.id;

        //Check for existing reservation
        const existedReservation = await Reservation.find({user: req.user.id});

        //If the user is not an admin, they can only create 3 queues
        if (existedReservation.length >= 3 && req.user.role !== 'admin') {
            return res.status(400).json({success: false, message: `The user with the id ${req.user.id} has already made 3 queues`});
        }

        req.body.shop = req.params.shopID;

        const shop = await Shop.findById(req.params.shopID);

        if (!shop) {
            return res.status(404).json({success: false, message: `No shop with the id of ${req.params.shopID}`});
        }

        const reservation = await Reservation.create(req.body);

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({success: false, message: "Cannot create reservation"});
    }
}

//@desc     Update reservation
//@route    PUT /api/v1/reservations/:id
//@access   Private

exports.updateReservation= async (req,res,next) => {
    try {        
        let reservation = await Reservation.findById(req.params.id);

        //Make sure the user is appointment owner
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to update this reservation`});
        }

        if (!reservation) {
            return res.status(404).json({success: false, message: `No reservation with the ID of ${req.params.id}`});
        }

        reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: reservation
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({success: false, message: "Cannot update reservation!"});
    }
}

//@desc     Delete reservations
//@route    Delete /api/v1/reservation/:id
//@access   Private
exports.deleteReservation = async (req,res,next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        //Make sure user is the reservation owner
        if (reservation.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({success: false, message: `User ${req.user.id} is not authorized to delete this reservation`});
        }

        if (!reservation) {
            return res.status(404).json({success: false, message: `No reservation with the id of ${req.params.id}`});
        }

        await reservation.deleteOne();

        res.status(200).json({success: true, data: {}});
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: "Cannot delete reservation"});
    }
};