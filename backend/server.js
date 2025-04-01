const express = require('express');

const app = express();
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cloudinary = require("cloudinary").v2;
const PORT = process.env.PORT || 5000;

const databaseConnect = require('./config/database');
const authRouter = require('./routes/authRoute');
const messengerRoute = require('./routes/messengerRoute');
const errorHandler = require('./error-handler');

require("dotenv").config();

const server = http.createServer(app);

// Initialize socket.io by passing the HTTP server
const io = require('./socket.js')(server);

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/messenger',authRouter);
app.use('/api/messenger',messengerRoute);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});

databaseConnect();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(errorHandler);

server.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})