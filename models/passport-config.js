const LocalStrategy = require("passport-local").Strategy;


function intialize(passport) {
  const authenticateUser = (email, passport, done) =>{
    const user = getUserbyEmail(email)
    if (user == null) {
      return done(null, false, {message:'No user found'})
    }
  }

    passport.use(new LocalStrategy({ usernameField: 'email' }), authenticateUser)
  passport.serializeUser((user,done)=>{})
  passport.deserializeUser((id,done)=>{})
}
