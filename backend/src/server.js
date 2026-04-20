require("dotenv").config();

const app = require("./app");

const connectDB = require("./config/db");

/*
=====================================

START SERVER

=====================================
*/

const PORT = process.env.PORT || 5000;

/*
connect to database first
*/

connectDB();

/*
start express server
*/

app.listen(PORT, () => {

 console.log(`Server running on port ${PORT}`);

});