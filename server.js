require('dotenv').config();

const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer') 
const port = process.env.PORT || 3019;


const app = express();
app.use(express.static(__dirname))
app.use(express.urlencoded({extended:true}))

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection
db.once('open',()=>{
    console.log("Mongodb connection successful")
})


const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
});
const Users = mongoose.model("data", userSchema);


app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'form.html'))
})


app.post('/post', async (req, res) => {
    const { username, password } = req.body;
    const existingUser = await Users.findOne({ username });
    if (existingUser) {
        return res.status(200).send("Successful");
    }
    const user = new Users({ username, password });
    await user.save();
    console.log(user);
    res.send("Successful");
});

app.post('/logout', async (req, res) => {
    const { username } = req.body;
    await Users.deleteOne({ username });
    res.send("User logged out and data removed");
});


const ticketSchema = new mongoose.Schema({
    event: String,
    price: Number,
    available: Boolean
});
const Ticket = mongoose.model("ticket", ticketSchema);

app.post('/add-ticket', async (req, res) => {
    const { event, price } = req.body;
    const ticket = new ticket({
        event,
        price,
        available: true
    });
    await ticket.save();
    res.send("Ticket added successfully");
});

app.post('/remove-ticket', async (req, res) => {
    const { ticketId } = req.body;
    await Ticket.findByIdAndDelete(ticketId);
    res.send("Ticket removed (sold out)");
});



const sellticketSchema = new mongoose.Schema({
    eventName: String,
    eventDate: String,
    venue: String,
    ticketCount: Number,
    price: Number,
    sellerName: String,
    sellerEmail: String,
    description: String,
    ticketImage: String 
});
const SellTicket = mongoose.model("SellTicket", sellTicketSchema);


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });


app.post('/api/sell-ticket', upload.single('ticketImage'), async (req, res) => {
    try {
        const ticket = new SellTicket({
            eventName: req.body.eventName,
            eventDate: req.body.eventDate,
            venue: req.body.venue,
            ticketCount: req.body.ticketCount,
            price: req.body.price,
            sellerName: req.body.sellerName,
            sellerEmail: req.body.sellerEmail,
            description: req.body.description,
            ticketImage: req.file ? req.file.filename : null
        });
        await ticket.save();
        res.send("Ticket submitted successfully!");
    } catch (err) {
        res.status(500).send("Error saving ticket: " + err.message);
    }
});


app.listen(port, '0.0.0.0', () => {
    console.log("Server started")
})
