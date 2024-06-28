const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const passport = require("passport");
const session = require("express-session");
require("./auth");

const port = 7000;

//initializing app
const app = express();

//middlewares
app.use(
  session({
    secret: process.env.SESSION_SECRET,
  })
);
app.use(passport.initialize());
app.use(passport.session());

//entry route
app.get("/", (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

//middleware function to check whether the user is signed in or not. If signed in the req will have user object.
const isLoggedIn = (req, res, next) => {
  req.user ? next() : res.sendStatus(401);
};

//google login route
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

//google callback route, what to do when the login in success or failure
app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/protected",
    failureRedirect: "/auth/failure",
  })
);

//route for login error
app.get("/auth/failure", (req, res) => {
  res.send("something went wrong!");
});

//protected route for logged in user
app.get('/protected', isLoggedIn, (req, res) => {
    console.log(req.user);
    res.send(`
        Hello ${req.user.displayName}
        <button id="logoutButton">Logout</button>
        <script>
            document.getElementById('logoutButton').addEventListener('click', () => {
                fetch('/logout', {
                    method: 'GET',
                    credentials: 'same-origin'
                }).then(() => {
                    window.location.href = '/';
                });
            });
        </script>
    `);
});

//logout path
app.get("/logout", (req, res) => {
  req.logout((error) => {
    if (error) {
      return error;
    }
    res.redirect("/");
  });
});

app.listen(port, () => console.log(`Listening at:${port}`));
