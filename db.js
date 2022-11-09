const mongoose = require("mongoose");
const testDB =
  "mongodb://admin:abc123456@localhost:27017/test?authSource=admin";

mongoose.connect(
  testDB,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err) {
    if (err) {
      console.log(err);
      console.log("MongoDB connect fail.");
    } else {
      console.log("MongoDB connect success.");
    }
  }
);
module.exports = mongoose;
