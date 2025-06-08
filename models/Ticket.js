const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    name: { type: String, required: true }, 
    price: { type: Number, required: true },
    available: { type: Number, required: true },
    eventDate: { type: String },
    venue: { type: String },
    sellerName: { type: String },
    sellerEmail: { type: String },
    description: { type: String },
    ticketImageBase64: { type: String }
});

module.exports = mongoose.model('Ticket', TicketSchema);