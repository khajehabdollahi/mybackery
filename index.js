if (process.env.NODE_ENV !=='production') {
  require('dotenv').config()
}


const express = require('express')
const app = express()
const path = require('path')
const Backery = require("./models/backery");
const Bbackery = require('./models/bbackery')

const Newbackery= require('./models/newbackery')

//  const BackeryInfo = require("./models/addBackeryInfo");
const ejsMate=require('ejs-mate')
const methodOverride = require('method-override')
// const initializePassport = require('./models/passport-config')

const passport = require('passport')
const LocalStrategy = require('passport-local')
const flash = require('connect-flash')
const User= require('./models/user')
const Userr = require('./models/userr')

const morgan = require('morgan')
const session = require('express-session')

const bcrypt = require('bcrypt')

const multer=require('multer')

const { storage } = require ('./cloudinary/index')

const upload = multer({storage});



// initializePassport(passport)

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/backery1", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.engine('ejs',ejsMate)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')






// passport.serializeUser(User.serializeUser())
// passport.deserializeUser(User.deserializeUser())

app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"));

app.use(
  session({
    secret: "notAGoodSecret",
    resave: false,
    saveUninitialized: false,
  })
);

// app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  res.locals.currentUser = req.user
  next()
})

passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())




const requiredLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

// const hashPassword = async (pw) => {
//   const salt = await bcrypt.genSalt(10)
//   const hash= await bcrypt.hash(pw,salt)
//   console.log('here is the salt: ' + salt);
//   console.log('here is the hash: ' + hash);
// }
// hashPassword('m')

// const login = async (pw, hashedPw) => {
//   const result = await bcrypt.compare(pw, hashedPw)
//   if (result) {
//     console.log('yes you did it')
//   }
//   else {
//     console.log('try again')
//   }
// }

// login("m", "$2b$10$2qpir3zizkvIM2KWypkUgOwy0UpSM8O.yPyv7qvJfeuHEX4mBszS2");

//set a function to Authenticated

app.get("/secret", (req, res) => {
  if (!req.session.user_id) {
   return res.redirect('/login')
  }
    res.render('secret');
})
// const infoManaging = ((req, res,next) => {
//   // if (!LogIn)
//   // { res.render('login') }
//   next()
// })

app.get("/newones", requiredLogin, (req, res) => {
  res.render("newone");
});

app.post("/newb",upload.single('image'),  async (req, res) => {
  const b = new Newbackery(req.body);

  await b.save();
  // res.redirect("/");
  res.send(req.body)
});


app.get("/newb/:id", async (req, res) => {
  const { id } = req.params;
  const backery = await Newbackery.findById(id).populate('creatorbyId');
  //  const c = user._id;
  res.render("backeryDetail", { backery });
});

app.get("/newb/:id/edit",requiredLogin, async (req, res) => {
  const { id } = req.params
  const backery = await Newbackery.findById(id);
  // res.send(backery);
  res.render("edit", { backery });
});

app.put("/newb/:id", async (req, res) => {
  const { id } = req.params;
  const backery = await Newbackery.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  res.redirect("/backeries");
});

app.delete("/newb/:id", async (req, res) => {
  const { id } = req.params;
  await Newbackery.findByIdAndDelete(id);
  //  req.flash("mes", "Yes deleted a backery");
  res.redirect("/");
});


app.get("/new", (req, res) => {
  req.session.returnTo = req.originalUrl;
  res.render("newbackery");
});

app.post("/newbacky", async (req, res) => {
  const backery = new Backery(req.body.backery);
  await backery.save();
  // req.flash('mes','Yes you added a new Backery')
  res.redirect("/");
});

app.get('/backeries', async (req, res) => {
  const backeries = await Newbackery.find({});
 
  res.render('backeries', {backeries})
})

// app.get('/backeries/:id', async (req, res) => {
//   const { id } = req.params
//   const backery = await Backery.findById(id)
//    res.render('backery', {backery})
// })



// app.get("/backeries/:id/edit", async (req, res) => {
  
//       const { id } = req.params;
//       const backery = await Backery.findById(id);
//       //res.send('edit backery')
//       res.render("edit", { backery });
//     ;
// });


// app.put('/backeries/:id', async (req, res) => {
//   const { id } = req.params;
//   const backery = await Backery.findByIdAndUpdate(id, req.body, {runValidators: true, new:true});
//   res.redirect('/backeries')
// })

// app.delete('/backeries/:id',   async (req, res) => {
//   const { id } = req.params;
//   await Backery.findByIdAndDelete(id)
// //  req.flash("mes", "Yes deleted a backery");
//   res.redirect('/')
// })



// app.get("/bbackery",  (req, res) => {

//   res.render('addBackeryInfo')
 
// });
// app.post("/bbackery", async (req, res) => {
//   const bbackery = new BBackery(req.body);
//   await bbackery.save();
//   // req.flash('mes','Yes you added a new Backery')
//   res.redirect("/");
// });




app.get('/', (req, res) => {
  res.render("home");
})

// app.get("/backeries/:id/addinfo", (req, res) => {
//   res.send('addBackeryInfo');
 
// });



// app.post('/register', async (req, res) => {
//   const {email, username, password } = req.body;
//   const user = new User({ username, email });
//   const registeredUser = await user.register(user, password)
//   console.log(registeredUser)
//   res.redirect('/')

// })



// app.post('/login', passport.authenticate('local',{failureRedirect:'/login'}), (req, res) => {
 
//   res.redirect('/backeries')
// })

app.get('/register', (req, res) => {
  res.render('registerr')
})
app.post('/register', async (req, res) => {
  const {email, password} =req.body
  const hash = await bcrypt.hash(password, 12)
 
  const user = new Userr({
    email,
    password:hash
  })
  await user.save()
  req.session.user_id = user._id;
  
  
  res.render('showuser', {user})
})

app.get('/login', async (req, res) => {
  res.render('login')
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = await Userr.findOne({ email })
  
    const validPassword = await bcrypt.compare(password, user.password);
  if (validPassword) {
    req.session.user_id = user._id
    
    const redirectUrl = req.session.returnTo || res.render('loginWelcome',{user});
    res.redirect(redirectUrl);
  }
   else {
      res.send("Your password is incorrect");
    }
})



app.get('/users', async(req, res) => {
  const allUsers = await Userr.find({})
  res.render('allUsers', {allUsers})
})

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await Userr.findById(id);
  // res.send(user)
  res.render("user", { user });
});


// app.get("/activate/:id", async (req, res) => {
//   let user = await User.findOne({ _id: req.params.id });
//   if (user) {
//     user.activated = true;
//     await user.save();
//     res.send("Account is activated now");
//     res.redirect("http://localhost:3000/welcomeuser?id=" + req.params.id).end();
//   } else {
//     res.send("Activation Failed");
//   }
// });

// app.post("/api/login", async (req, res, next) => {
//   await passport.authenticate("local", (err, user, info) => {
//     if (err) {
//       return next(err);
//     }
//     if (!user) {
//       return res.status(404).send("Username or Password incorrect!");
//     } else if (!user.activated) {
//       return res.status(404).send("User is not Activated, pls Activate!");
//     }
//     req.logIn(user, (err) => {
//       if (err) {
//         return next(err);
//       }
//       return res
//         .status(200)
//         .send({ id: user._id, username: user.username, role: user.role });
//     });
//   })(req, res, next);
// });

app.get("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/");
});

app.post("/logout", async (req, res) => {
  req.session.user_id = null;
  res.redirect("/");
});

app.use((req, res) => {
  res.status(404).send(`<h1>The page is not defined</h1>`)
})
app.listen(3000, () => {
  console.log('start')
})