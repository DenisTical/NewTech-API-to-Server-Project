//Imports
const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./Routes/ShiftsRoutes');
const users = require('./Routes/UserRoutes');
const comments = require('./Routes/CommentsRoutes');
const dotenv = require('dotenv');
dotenv.config({path: "./config.env"});
const mongoose = require('mongoose');
const expressRateLimit = require('express-rate-limit');

//Middleware
const limiter = expressRateLimit({
    max: 50,
    window: 60 * 60 * 1000,
    message: "Too many requests from this API."
});
app.use(limiter);
app.use(express.json());
app.use(cors());

app.use('/api/shifts', routes);
app.use('/api/users', users);
app.use('/api/comments', comments);

//Mongoose connection to MongoDB
mongoose.connect(process.env.STR_MONGO).then((connect) => {
    console.log("MongoDB Server connected!");
    }).catch((err => {
        console.log("Error connecting to MongoDB Server!", err);
}));

//Server
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started...");
});