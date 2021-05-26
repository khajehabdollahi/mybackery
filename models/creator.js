const mongoose = require("mongoose");

const creatorSchema = new mongoose.Schema({
  backerysname: {
    type: String,
    required: true,
  },

  
});

const Creator = mongoose.model("Creator", creatorSchema);

module.exports = Creator;
