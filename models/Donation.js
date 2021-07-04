const mongoose = require("mongoose");

const donateSchema = new mongoose.Schema({
  amount: {
    type: Number,
  },
  doneatorId: {
    type: String,
  },
  backeryId: {
    type: String,
  },
  confirmation: {
    type: Boolean,
    default: false,
  }
});

const Donate = mongoose.model("Donation", donateSchema);

module.exports = Donate;
