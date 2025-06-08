const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    quantity: { type: Number, required: true },
    cardHolderName: { type: String, required: true }
});

module.exports = mongoose.model('Order', OrderSchema);