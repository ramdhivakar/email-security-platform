const express = require("express");

const cors = require("cors");


const authRoutes = require("./routes/authRoutes");

const emailRoutes = require("./routes/emailRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");

const quarantineRoutes = require("./routes/quarantineRoutes");

const app = express();


/*
=====================================

MIDDLEWARE

=====================================
*/

app.use(cors());

app.use(express.json());


/*
=====================================

ROUTES

=====================================
*/

app.use("/api/auth", authRoutes);

app.use("/api/email", emailRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/quarantine", quarantineRoutes);

/*
=====================================

TEST ROUTE

=====================================
*/

app.get("/", (req, res) => {

 res.send("Cloud Email Security API running");

});


module.exports = app;