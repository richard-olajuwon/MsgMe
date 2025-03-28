const express = require('express');

const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;

const databaseConnect = require('./config/database');
const authRouter = require('./routes/authRoute');
const messengerRoute = require('./routes/messengerRoute');
const errorHandler = require('./error-handler');

require("dotenv").config();

app.use(bodyParser.json());
app.use(cookieParser());
app.use('/api/messenger',authRouter);
app.use('/api/messenger',messengerRoute);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});

databaseConnect();

app.use(errorHandler);

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
})