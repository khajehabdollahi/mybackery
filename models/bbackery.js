const mongoose = require("mongoose");

const bbackerySchema = new mongoose.Schema({
  backerysName: {
    type: String,
    required: true,
  },
  ownersName: {
    type: String,
  },
  ownersFamily: {
    type: String,
  },
  numberOfPoorPeople: {
    type: Number,
    required: true,
  },
  averageMonthlyIncomPerPerson: {
    type: Number,
  },
  location: {
    type: String,
  },
  creator: {
    type: String
  }
});

const Bbackery = mongoose.model("Bbackery", bbackerySchema);

module.exports = Bbackery;

