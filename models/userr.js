const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
   name: {
     type: String,
    
  },
   
  role: {
     type: String,
   },
  //password will be hashed
  password: {
    type: String,
    required: true,
  },
});

//userSchema.plugin(passportLocalMongoose, { usernameField : 'email'});

module.exports = mongoose.model("Userr", userSchema);
