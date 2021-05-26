const mongoose = require('mongoose')

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
  },
  location: {
    type: String,
  },
  creator: {
    type: String,
  },
  cCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Userr'
  }
});


const Backery = mongoose.model('Backery', backerySchema)

module.exports = Backery


 
   