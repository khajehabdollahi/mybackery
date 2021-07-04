const mongoose = require("mongoose");

const backerySchema = new mongoose.Schema({
  backerysname: {
    type: String,
    required: true,
  },
  ownersName: {
    type: String,
    required: true,
  },
  ownersFamily: {
    type: String,
    required: true,
  },
  numberOfPoorPeople: {
    type: Number,
    required: true,
  },
  averageMonthlyIncomPerPerson: {
    type: Number,
    required: true,
  },
  image: {
    type: String
  },
  location: {
    type: String,
  },
  donations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
    },
  ],
  creator: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: String,
  },
});

const Newbackery = mongoose.model("Backery", backerySchema);

module.exports = Newbackery;
