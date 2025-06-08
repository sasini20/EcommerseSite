const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Order = require('../models/Order');
const ContactMessage = require('../models/ContactMessage');

const router = express.Router();
const JWT_SECRET = 'your_jwt_secret_key';

// User registration
router.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists.' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// User login
router.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }
        const token = jwt.sign({ userId: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Add ticket (Sell)
router.post('/api/tickets', async (req, res) => {
    try {
        const ticket = new Ticket({
            name: req.body.eventName,
            price: req.body.price,
            available: req.body.ticketCount,
            eventDate: req.body.eventDate,
            venue: req.body.venue,
            sellerName: req.body.sellerName,
            sellerEmail: req.body.sellerEmail,
            description: req.body.description,
            ticketImageBase64: req.body.ticketImageBase64
        });
        await ticket.save();
        res.status(201).json({ message: 'Ticket added successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to add ticket.' });
    }
});

// List tickets (Events)
router.get('/api/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find();
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch tickets.' });
    }
});

// Buy ticket (Order)
router.post('/api/orders', async (req, res) => {
    const { ticketId, quantity, username, cardHolderName } = req.body;
    if (!ticketId || !quantity || !username || !cardHolderName) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }
    try {
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found.' });
        }
        if (ticket.available < quantity) {
            return res.status(400).json({ message: 'Not enough tickets available.' });
        }
        ticket.available -= quantity;
        await ticket.save();

        if (ticket.available === 0) {
            await Ticket.findByIdAndDelete(ticket._id);
        }
        let user = await User.findOne({ username });
        if (!user) {
            user = new User({ username, password: '' }); 
            await user.save();
        }
        const order = new Order({
            user: user._id,
            ticket: ticket._id,
            quantity,
            cardHolderName
        });
        await order.save();
        res.status(201).json({ message: 'Order placed successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to place order.' });
    }
});

// Contact form - send email
const nodemailer = require('nodemailer');

router.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    try {
       
        await ContactMessage.create({ name, email, message });
        
        let transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: 'hprabo970827@gmail.com', 
                pass: 'llni abny xjmu btln'
            }
        });
        
        let mailOptions = {
            from: `${email}`,
            to: 'hprabo970827@gmail.com', 
            subject: `Contact Form Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        };
       
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send message.' });
    }
});

module.exports = router;