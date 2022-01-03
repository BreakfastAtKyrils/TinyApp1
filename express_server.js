const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
//const req = require("express/lib/request");
// const getIdByEmail = require("./helpers.js")
// const checkEmail = require("./helpers.js")
const { getIdByEmail, checkEmail } = require("./helpers.js")

app.use(cookieSession({
  name: 'session',
  keys: [0],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "greg_user_id" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "greg_user_id" },
  "short1": { longURL: "http://www.google.com", userID: "greg_user_id" },
  "short2": { longURL: "http://www.google.com", userID: "greg_user_id" },
};

//hashed passwords for initial user for testing
const greg_password = '11';
const greg_hash = bcrypt.hashSync(greg_password, 10);

const users = { 
 "greg_user_id": {
    id: "greg_user_id", 
    email: "greg@gmail.com", 
    password: greg_hash,
  }
}

function generateRandomString() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = '';
  for (let x = 0; x < 6; x++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
function getPasswordByEmail(email) {
  for (const user in users) {
    if (email === users[user].email){
      return users[user].password
    }
  }
}
function getIdByShortURL(shortURL) {
  return urlDatabase[shortURL].userID;
}
//returns an array with the filtered shortURLs based on the user id
function urlsForUser(id) {
  let urls = [];

  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id){
      urls.push(shortURL);
    }
  }
  return urls;
}

//test space

console.log("testing checkIdByEmail functionality:")
console.log(getIdByEmail("greg@gmail.com", users))

//test space end



app.get("/urls", (req, res) => {
  //display this if user not logged in
  if (!req.session.user_id) {
    const templateVars = { 
      user: undefined,
    };

    return res.render("urls_index", templateVars)
  }

  //get the urls associated with the user id
  let urls = urlsForUser(req.session.user_id);

  //this will hold only the URLs associated with the user's id
  const userDatabase = {}

  for (const url of urls) {
    userDatabase[url] = urlDatabase[url].longURL;
  }

  //add the URLs to the template vars passed to the render function
  const templateVars = { 
    urls: userDatabase,
    user: users[req.session.user_id],
  };

  return res.render("urls_index", templateVars)
})

//registration page
app.get("/register", (req, res) => {

  const templateVars = { 
    user: users[req.session.user_id],
  };
  return res.render("register", templateVars);
})

//create a new URL
app.get("/urls/new", (req, res) => {
  //if user not logged in:
  if (!req.session.user_id){
    res.redirect("/login");
  }

  const templateVars = { 
    user: users[req.session.user_id],
  };

  return res.render("urls_new", templateVars);
});

//displays a specific URL page --> use urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  //if user is not logged in we redirect to the login page
  if (!req.session.user_id){
    return res.redirect("/login");
  }

  const shortURL = req.params.shortURL;
  let belongs =  true;
  //if the url does not belong to the user, belongs = false
  if (req.session.user_id !== getIdByShortURL(shortURL)){
    belongs = false;
  }

  const templateVars = { 
    belongs,
    shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    user: users[req.session.user_id],
  };

  return res.render("urls_show", templateVars);
})

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

//redirects to the actual URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  return res.redirect(longURL);
});

//add new URL
app.post("/urls", (req, res) => {
  //if user not logged in:
  if (!req.session.user_id){
    return res.redirect("/login");
  }

  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id

  urlDatabase[shortURL] = {
    longURL,
    userID,
  }

  return res.redirect(`/urls/${shortURL}`)
});

app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.session.user_id],
  };
  return res.render("login", templateVars);
})

//updates a URL
app.post("/urls/:id", (req, res) => { 
  //this method receives longURL + short from the .ejs file
  //therefore, we can use the shortURL to find the userID, and then check if it belongs to the logged in user
  if (req.session.user_id !== getIdByShortURL(req.body.short)) {
    //res.send('this url does not belong to you')
    return res.redirect("/urls")
  }

  urlDatabase[req.body.short] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  }
  return res.redirect(`/urls`)
})

//deletes URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.session.user_id){
    res.redirect("/login");
  }

    //if shortURL does not belong to user
  if (req.session.user_id !== getIdByShortURL(req.body.short)) {
    res.send('this url does not belong to you')
    res.redirect("/urls")
  }

  delete urlDatabase[req.params.shortURL]

  res.redirect("/urls")
})

//logs in
app.post("/login", (req, res) => {
  console.log('POST /login')

  if (!checkEmail(req.body.email, users)){
    res.status(403);
    return res.send('403: Email not found'); 
  } 

  if (!bcrypt.compareSync(req.body.password, getPasswordByEmail(req.body.email))) {
    res.status(403);
    return res.send('403: Incorrect Password'); 
  }

  const id =  getIdByEmail(req.body.email, users)
  req.session.user_id = id;
  
  return res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  //res.clearCookie('user_id')
  //how to clear cookies with cookie-session
  return res.redirect("/urls")
})

app.post("/register", (req, res) => {
  console.log('POST /register')

  //check if either email/password are empty strings
  if(!req.body.email || !req.body.password){
    res.status(400);
    res.send('400: Email or Password cannot be empty !!!');  
    return;
  }
  //check if email is already registered
  if (checkEmail(req.body.email, users)){
    res.status(400);
    return res.send('Email already in use!');
  }

  //generating user id
  const id = generateRandomString();

  //hashing password
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  //adding to users object 
  users[id] = {
    id: id,
    email: req.body.email,
    password: hashedPassword,
  }

  //add id to cookie 
  req.session.user_id = id;

  return res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`Pavle Gregory Kyril are all listening on port ${PORT}!`);
});