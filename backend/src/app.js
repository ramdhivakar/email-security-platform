const express = require("express");

const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const emailRoutes = require("./routes/emailRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");

const quarantineRoutes = require("./routes/quarantineRoutes");

const policyRoutes = require("./routes/policyRoutes");

const logRoutes = require("./routes/logRoutes");

const smtpRoutes = require("./routes/smtpRoutes");

const userRoutes = require("./routes/userRoutes");

const smtpOutboundRoutes = require("./routes/smtpOutboundRoutes");

const app = express();


app.use(cors());

app.use(express.json());


app.use("/api/auth", authRoutes);

app.use("/api/email", emailRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/quarantine", quarantineRoutes);

app.use("/api/policy", policyRoutes);

app.use("/api/logs", logRoutes);

app.use("/api/smtp", smtpRoutes);

app.use("/api/users", userRoutes);

app.use("/api/smtp/outbound", smtpOutboundRoutes);


app.get("/", (req, res) => {

 res.send("Cloud Email Security API running");

});


module.exports = app;