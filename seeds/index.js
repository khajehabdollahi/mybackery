const Backery = require("../models/backery");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/backery1", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const backer2 = new Backery({
  email: "a2@b.c",
  name: "vv",
  cCreator: "60a97b50fe5b380c882fb4f7",
});

backer2.save().then(backer2=> {
  console.log(backer2)
}).catch(e => {
  console.log(e)
})

const seedBackery = [
  {
    email: 'g@f',
    name: 'g',
    cCreator:'60a97b50fe5b380c882fb4f7'
  },
  {
    email: 'f@f',
    name: 'k',
    cCreator:'60a97b50fe5b380c882fb4f7'
  },
  {
    email: 'c@f',
    name: 'r',
    cCreator:'60a97b50fe5b380c882fb4f7'
  },
]

Backery.insertMany(seedBackery)