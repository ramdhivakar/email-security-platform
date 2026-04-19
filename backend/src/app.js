const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const emailRoutes = require("./routes/emailRoutes");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {

 res.send("Email Security API running");

});


app.use("/api/auth", authRoutes);

app.use("/api", testRoutes);

app.use("/api", emailRoutes);


module.exports = app;