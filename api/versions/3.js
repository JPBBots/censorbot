const express = require("express");
var app = express.Router();

app.get("*", (req,res) => {
    res.status(403);
    res.json({
        error: "WIP"
    })
})

module.exports = app;