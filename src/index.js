const express = require("express");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");

const route = require("./route/route.js");
const app = express();
const multer = require('multer');




app.use(bodyParser.json()); // tells the system that you want json to be used
// app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(multer().any());
// mongoDb connection
mongoose
  .connect(
    "mongodb+srv://mahesh999333:mahesh999333@cluster0.tecej.mongodb.net/BookManagment",
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("MongoDb connected"))
  .catch((err) => console.log(err));

// Initial route
app.use("/", route);

// port
app.listen(process.env.PORT || 3000, function () {
  console.log("Express app running on port " + (process.env.PORT || 3000));
});
