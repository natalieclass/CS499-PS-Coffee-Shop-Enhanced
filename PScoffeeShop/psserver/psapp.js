require('dotenv').config();
const express = require('express');
const cors = require('cors');
const psapp = express();
const path = require('path');
const bodyParser = require('body-parser');


psapp.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:6363' }));

psapp.use(bodyParser.json());
psapp.use(bodyParser.urlencoded({extended:false}));
psapp.use("/psclient", express.static(path.resolve(__dirname + "/../psclient/")));


const customerRoutes = require('./routes/customerRoutes');
const errorHandler = require('./middleware/errorHandler');
const contactRoutes = require('./routes/contactRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
psapp.use('/', orderRoutes);
psapp.use('/', contactRoutes);
psapp.use('/', customerRoutes);
psapp.use('/', productRoutes);

//make the server
var port = process.env.PORT || process.env.NODE_PORT || 6363;

//page routers
var psrouter = require('./psrouter.js');
psrouter(psapp);

//error handling - must be used after every route
psapp.use(errorHandler);


//listen
psapp.listen(port, function(err){
  if(err){
    throw err;
  } else{
    console.log("Listening on port: " + port);
  }
});