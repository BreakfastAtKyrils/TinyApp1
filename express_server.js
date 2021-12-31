const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "greg@gmail.com", 
    password: "dishwasher-funk"
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

function checkEmail(email) {
  let emails = [];
  for (const user in users){
    emails.push(users[user].email);
  }
  if (!emails.includes(email)){
    return false;
  }
  return true;
}

//this get method simply renders all the URLs
app.get("/urls", (req, res) => {


  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };

  console.log('GET /urls')
  //console.log(templateVars)
  res.render("urls_index", templateVars)
})

//registration page
app.get("/register", (req, res) => {
  //console.log(req.cookies["user_id"].email)
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
})

//create a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

//displays a specific URL page --> use urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  //console.log('GET /urls/:shortURL !')

  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };

  res.render("urls_show", templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//redirects to the actual URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//adds new URL
app.post("/urls", (req, res) => {
  //console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  //console.log('here is the database after the action was performed:    ')
  //console.log(urlDatabase);

  res.redirect(`/urls/${shortURL}`)
});

app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars);
})

//updates a URL
app.post("/urls/:id", (req, res) => { 
  urlDatabase[req.body.short] = req.body.longURL;
  res.redirect(`/urls`)
})

//deletes URL
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(req.params)
  delete urlDatabase[req.params.shortURL]

  console.log('here is the database after the action was performed:    ')
  console.log(urlDatabase);

  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  console.log(req.body.username)
  res.cookie('username', req.body.username)
  console.log(res.cookie)

  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie('user_id')
  res.redirect("/urls")
})

app.post("/register", (req, res) => {
  console.log('POST /register')

  //check if either email/password are empty strings
  if(!req.body.email || !req.body.password){
    res.status(400);
    res.send('400: Email or Password cannot be empty !!!');  
  }
  //check if email is already registered

  if (checkEmail(req.body.email)){
    res.status(400);
    res.send('Email already in use!');
  }
  //generating user id
  const id = generateRandomString();

  //adding to users object --> tested and works 
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password,
  }

  //add id to cookie 
  res.cookie('user_id', id)


  //console.log(req.cookies.user_id)
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Pavle Gregory Kyril are all listening on port ${PORT}!`);
});