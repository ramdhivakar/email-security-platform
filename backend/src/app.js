const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());

app.use(express.json());


// base test route
app.get("/", (req, res) => {

 res.send("Email Security API running");

});


// auth routes
app.use("/api/auth", authRoutes);


module.exports = app;