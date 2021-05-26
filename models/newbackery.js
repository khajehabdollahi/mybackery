const mongoose = require("mongoose");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const mapBoxToken = process.env.Map_Token
const geoCoder=mbxGeocoding({ accessToken:mapBoxToken })


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
  location: {
    type: String,
  },
  creator: {
    type: String,
  },
  creatorid: {
    type: String,
  }
});

const Newbackery = mongoose.model("Newbackery", backerySchema);

module.exports = Newbackery;
