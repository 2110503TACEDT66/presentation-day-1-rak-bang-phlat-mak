const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be longer than 50 characters']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    tel: {
        type: String
    },
    openclose: {
        type: String,
        required: [true, 'Please add an open/close time']
        }
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Cascade delete
ShopSchema.pre('deleteOne', {document: true, query: false}, async function(next) {
    console.log(`Reservations are being removed from shop ${this._id}`);
    await this.model('Reservation').deleteMany({shop: this._id});
    next();
});

//Reverse populate with virtuals
ShopSchema.virtual('reservations', {
    ref: 'Reservation',
    localField: '_id',
    foreignField: 'shop',
    justOne: false
});

module.exports = mongoose.model('Shop', ShopSchema);