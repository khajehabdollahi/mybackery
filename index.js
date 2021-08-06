if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");

const nodemailer = require("nodemailer");
const mailer = require("./views/mailer");
const mailerForget = require("./views/mailerForget");

const Donate = require("./models/Donation");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");

const User = require("./models/User");
const Newbackery = require("./models/Backery");

const MongoStore = require("connect-mongo");

const multer = require("multer");

const { storage } = require("./cloudinary/index");
const console = require("console");

const upload = multer({ storage });

const dbUrl = "mongodb://localhost:27017/backery";

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret: "squirrel",
  },
});

store.on("error", function (e) {
  console.log("Error to save to dataBase", e);
});

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

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

const requiredLogin = (req, res, next) => {
  if (!req.user) {
    return res.redirect("/login");
  }
  next();
};

app.get("/secret", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  res.render("secret");
});

app.get("/newones", requiredLogin, (req, res) => {
  res.render("newone");
});

app.post("/newb", upload.single("image"), async (req, res) => {
  // console.log(req.body, req.file)
  const input = req.body;
  const b = new Newbackery(input);
  b.city = req.body.city.toLowerCase();
  b.provience = req.body.provience.toLowerCase();
  b.district = req.body.district.toLowerCase();
  b.Street = req.body.Street.toLowerCase();
  b.line = req.body.line.toLowerCase();
  b.image = req.file.path;
  b.creator.username = req.user.username;
  b.creator.name = req.user.name;
  b.creator.id = req.user.id;

  await b.save();
  res.redirect("/");
});

app.get("/newb/:id", async (req, res) => {
  const { id } = req.params;
  const backery = await Newbackery.findById(id).populate("creatorbyId");
  const donations = await Donate.find({ backeryId: id });
  res.render("backeryDetail", { backery, donations });
});

app.get("/newb/:id/edit", requiredLogin, async (req, res) => {
  const { id } = req.params;
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

app.get("/backeries", async (req, res) => {
  const backeries = await Newbackery.find({});

  res.render("backeries", { backeries });
});

app.get("/", (req, res) => {
  res.render("home");
});

//CHECK STRING LENGTH
const isValidData = (value, stringLength) => {
  let inValid = new RegExp("^[_A-z0-9]{1,}$");
  let result = inValid.test(value);
  if (result && value.length >= stringLength) {
    return true;
  }
  return false;
};

//REGISTER USER
app.get("/register", (req, res) => {
  res.render("registerr");
});

app.post("/register", async (req, res) => {
  let username = req.body.username;
  let name = req.body.name;
  let role = req.body.role;
  let inputPassword = req.body.password;
  console.log("PASSWORD: ", username)
  let password;

  if (!isValidData(inputPassword, 6)) {
    console.log("Password must be at least 6 characters without space!");
  } else {
    password = inputPassword
  }

  const newUser = new User({
    username,
    name,
    role,
    activated: false,
  });

  await User.register(newUser, password);
  // req.session.user_id = user._id;
  let { id } = await User.findOne({ username: username });
  mailer(
    username,
    "Welcome to web",
    "Yes you are very welcome now \n please activate ur account by clicking this link\n \n http://localhost:3000/activate/" +
      id
  ); //Detta lokal host ska ändras till domänen
  res.render("registerSuccess", { newUser });
  // res.render('login', {user})
});

app.get("/activate/:id", async (req, res) => {
  let user = await User.findOne({ _id: req.params.id });
  if (user) {
    user.activated = true;
    await user.save();
    res.send("Account is activated now");
    res.redirect("http://localhost:3000/welcomeuser?id=" + req.params.id).end();
    res.render("loginWelcome");
  } else {
    res.send("Activation Failed");
  }
});

app.get("/login", async (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res, next) => {
  await passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user.username) {
      const worngUser = req.body.username;
      return res.render("wrongEmail", { worngUser });
    }
    if (!user) {
      const worngUser = req.body.username;
      return res.render("wrongpassword", { worngUser });
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/users");
    });
  })(req, res, next);
});

app.get("/forgetpass", (req, res) => {
  res.render("foreget");
});

// app.post("/forgetpass", (req, res) => {
//   const { username } = req.body
//   const user = User.find({ "username": username });
//   console.log("FOUND USER", user.name)
// })

app.post("/forgetpass", async (req, res) => {
  const { username } = req.body;
  await User.find({ username }, function (err, user) {
    if (err) {
      console.log(err);
    } else {
      res.send(user);
      mailerForget(
        username,
        "Welcome to web",
        "Yes you are very welcome now \n please activate ur account by clicking this link\n \n (http://localhost:3000/resetpass/" +
          username
      );
      //Detta lokal host ska ändras till domänen
    }
  });
});

//RESET PASSWORD
app.get("/resetpass/:username", (req, res) => {
  const { username } = req.params;
  res.render("resetpass", { username });
});

app.put("/resetpass/:username", async (req, res) => {
  const { username } = req.params;
  const { password } = req.body;

  await User.findOne({ username }, (err, user) => {
    if (err) {
      res.send("Password reset Failed");
    } else {
      console.log("USER:", user);
      user.setPassword(password, (error, returnedUser) => {
        if (error) {
          console.log(error)
        } else {
           returnedUser.save();
        }
      });      
      res.send(username);
    }
  });
});

app.get("/users", async (req, res) => {
  const allUsers = await User.find({});
  res.render("allUsers", { allUsers });
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  console.log("id: ", id);
  const user = await User.findById(id);
  console.log(user);
  res.render("showuser", { user });
});

app.get("/donate/:id", (req, res) => {
  const { id } = req.params;

  res.render("donate", { id });
});

app.get("/donateconfirm/:id", async (req, res) => {
  const { id } = req.params;
  const donate = await Donate.findById(id);

  res.render("donateconfirm", { donate });
});

app.put("/donateconfirm/:id", async (req, res) => {
  const { id } = req.params;
  const confirmation = req.body.confirmation;
  const donate = await Donate.findByIdAndUpdate(id);
  donate.confirmation = confirmation;
  console.log(donate);
  donate.save();
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

app.post("/d", async (req, res) => {
  // const donate=req.body
  const donated = new Donate(req.body);

  donated.backeryId = req.body.backeryId;
  donated.donatorId = req.body.donatorId;
  await donated.save();

  res.redirect("/");
  // res.render("donated", {id, donateAmount });
});

app.get("/search", (req, res) => {
  res.render("search");
});
app.get("/search/provience", (req, res) => {
  res.render("searchp");
});
app.post("/search/provience", async (req, res) => {
  const input = req.body.provience;
  const search = input.toLowerCase();

  console.log(search);

  let query = {
    $or: [{ provience: search }, { city: search }, { district: search }],
  };

  const backery = await Newbackery.find(query);
  res.render("resultp", { backery });
});

app.get("/search/village", (req, res) => {
  res.render("searchv");
});
app.post("/search/village", async (req, res) => {
  const input = req.body.vi;
  const search = input.toLowerCase();

  console.log(search);

  let query = {
    $or: [{ village: search }],
  };

  const backery = await Newbackery.find(query);
  res.render("resultP", { backery });
});

app.get("/search/street", (req, res) => {
  res.render("searchStLn");
});
app.post("/search/street", async (req, res) => {
  const input = req.body.searchKey;
  const search = input.toLowerCase();

  console.log(search);

  let query = {
    $or: [{ Street: search }, { line: search }],
  };

  const backery = await Newbackery.find(query);
  res.render("resultp", { backery });
});

app.get("/search/mobilenumber", (req, res) => {
  res.render("searchMnPc");
});

app.post("/search/mobilenumber", async (req, res) => {
  const input = req.body.searchKey;

  console.log(input);

  let query = {
    $or: [{ mobileNumber: input }, { postCode: input }],
  };

  const backery = await Newbackery.find(query);
  res.render("resultp", { backery });
});

app.get("/search/economylevel", (req, res) => {
  res.render("searchel");
});

app.post("/search/economylevel", async (req, res) => {
  const input = req.body.searchKey;

  console.log(input);

  const backery = await Newbackery.find()
    .where("averageMonthlyIncomPerPerson")
    .lte(input)
    .exec();
  res.render("resultp", { backery });
});

app.get("/search/numberpoor", (req, res) => {
  res.render("searchNPP");
});
app.post("/search/numberpoor", async (req, res) => {
  const input = req.body.searchKey;

  console.log(input);

  const backery = await Newbackery.find()
    .where("numberOfPoorPeople")
    .lte(input)
    .exec();
  res.render("resultp", { backery });
});

app.post("/api/login", async (req, res, next) => {
  await passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(404).send("Username or Password incorrect!");
    } else if (!user.activated) {
      return res.status(404).send("User is not Activated, pls Activate!");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res
        .status(200)
        .send({ id: user._id, username: user.username, role: user.role });
    });
  })(req, res, next);
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.use((req, res) => {
  res.status(404).send(`<h1>The page is not defined</h1>`);
});

app.listen(3000, () => {
  console.log("BACKERY SERVER RUNNING!");
});
