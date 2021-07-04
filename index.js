if (process.env.NODE_ENV !=='production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const session = require("express-session");
const path = require('path')
const mongoose = require("mongoose");

const Donate= require('./models/Donation')
const ejsMate=require('ejs-mate')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require("passport-local").Strategy;
const flash = require('connect-flash')

const User = require('./models/User')
const Newbackery = require("./models/Backery");



const MongoStore = require("connect-mongo");

const multer=require('multer')

const { storage } = require ('./cloudinary/index')

const upload = multer({storage});


const dbUrl = "mongodb://localhost:27017/backery";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "squirrel",
  },
});

store.on('error', function (e) {
  console.log('Error to save to dataBase',e)
})

const sessionConfig = {
  store,
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};




app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.engine('ejs',ejsMate)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next()
})

const requiredLogin = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
};

app.get("/secret", (req, res) => {
  if (!req.session.user_id) {
   return res.redirect('/login')
  }
    res.render('secret');
})


app.get("/newones",requiredLogin, (req, res) => {
 
  res.render("newone");
});


app.post("/newb", upload.single('image'), async (req, res) => {
  
  // console.log(req.body, req.file)
  const b = new Newbackery(req.body);
  b.image = req.file.path;
  b.creator.username = req.user.username;
  b.creator.name = req.user.name;
  b.creator.id = req.user.id;
  
  await b.save();
  res.redirect("/");

});


app.get("/newb/:id", async (req, res) => {
  const { id } = req.params;
  const backery = await Newbackery.findById(id).populate('creatorbyId'); 
  const donations = await Donate.find({ backeryId: id });
  res.render("backeryDetail", { backery, donations});
});



app.get("/newb/:id/edit",requiredLogin, async (req, res) => {
  const { id } = req.params
  const backery = await Newbackery.findById(id);
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
  let username = req.body.username;
  let name = req.body.name;
  let role = req.body.role;
  let password = req.body.password;
 
  const newUser = new User({
    username,
    name,
    role
  })

  await User.register(newUser, password);
  // req.session.user_id = user._id;
  res.redirect('/')
  // res.render('login', {user})
})

app.get('/login', async (req, res) => {
  res.render('login')
})

app.post("/login", async (req, res, next) => {
  await passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect("/login");
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/users");
    });
  })(req, res, next);
});

app.get('/users', async(req, res) => {
  const allUsers = await User.find({})
  res.render('allUsers', {allUsers})
})

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  // res.send(user)
  res.render("showuser", { user });
});

app.get("/donate/:id", (req, res) => {
  const { id } = req.params;

  res.render("donate",{id});
});

app.get('/donateconfirm/:id', async (req, res) => {
  const { id } =  req.params;
  const donate = await Donate.findById(id);
  
  res.render("donateconfirm",{donate})

})

app.put("/donateconfirm/:id", async (req, res) => {
  const { id } = req.params;
  const donate = await Donate.findByIdAndUpdate(id, { confirmation: true });
  donate.save()
  res.redirect(`/backeries`);
});

// app.put("/donate/:id", async (req, res) => {
//   const { id } = req.params;
//   const backery = await Newbackery.findByIdAndUpdate(id, req.body, {
//     runValidators: true,
//     new: true,
//   });
//   res.redirect("/backeries");
// });

app.post("/d", async(req, res) => {
   
  // const donate=req.body
  const  donated  = new Donate(req.body);


   donated.backeryId = req.body.backeryId;
   donated.donatorId = req.body.donatorId;
  await donated.save();

   res.redirect("/");
  // res.render("donated", {id, donateAmount });
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
  req.logout();
  res.redirect("/");
});



app.use((req, res) => {
  res.status(404).send(`<h1>The page is not defined</h1>`)
})

app.listen(3000, () => {
  console.log('BACKERY SERVER RUNNING!')
})