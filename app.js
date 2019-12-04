const express = require('express')
const app = express()
const port = 3000
const mongoose = require('mongoose');
const { dburl } = require('./app/config/config');

mongoose.connect(dburl);
let db = mongoose.connection;

db.once('open', function(){

    app.use('/', require('./app/routes/router'));
    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
})

db.on('error', function(err){
    console.log("what's wrong with database", err);
})

module.exports = app;