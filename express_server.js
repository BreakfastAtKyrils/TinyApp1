const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');

app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "greg_user_id" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" },
  "short1": { longURL: "http://www.google.com", userID: "user3RandomID" },
  "short2": { longURL: "http://www.google.com", userID: "user3RandomID" },
};

console.log(urlDatabase["short2"].longURL)

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "greg_user_id": {
    id: "greg_user_id", 
    email: "greg@gmail.com", 
    password: "11"
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
  if (emails.includes(email)){
    return true;
  }
  return false;
}

function getPasswordByEmail(email) {
  for (const user in users) {
    if (email === users[user].email){
      return users[user].password
    }
  }
}

function getIdByEmail(email) {
  for (const user in users) {
    if (email === users[user].email){
      return users[user].id
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



//this get method renders all the URLs
app.get("/urls", (req, res) => {

  //display this if user not logged in
  if (!req.cookies["user_id"]) {
    const templateVars = { 
      user: undefined,
    };

    res.render("urls_index", templateVars)
  }

  //get the urls associated with the user id
  let urls = urlsForUser(req.cookies["user_id"]);

  //this will hold only the URLs associated with the user's id
  const userDatabase = {}

  for (const url of urls) {
    userDatabase[url] = urlDatabase[url].longURL;
  }
  console.log('here is the userDatabse that will be added to template vars to render /urls_index')
  console.log(userDatabase)
  

  const templateVars = { 
    urls: userDatabase,
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
  if (!req.cookies["user_id"]){
    res.redirect("/login");
  }
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

//displays a specific URL page --> use urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  //if user is not logged in we redirect to the login page
  if (!req.cookies["user_id"]){
    res.redirect("/login");
  }

  const shortURL = req.params.shortURL;
  let belongs =  true;
  //if the url does not belong to the user, redirect to the /urls page:
  if (req.cookies["user_id"] !== getIdByShortURL(shortURL)){
    belongs = false;
  }

  const templateVars = { 
    belongs,
    shortURL, 
    longURL: urlDatabase[shortURL].longURL,
    
    user: users[req.cookies["user_id"]],
  };

  res.render("urls_show", templateVars);
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//redirects to the actual URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//adds new URL
app.post("/urls", (req, res) => {
  //if user not logged in:
  if (!req.cookies["user_id"]){
    res.redirect("/login");
  }
  //console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.cookies["user_id"]
  urlDatabase[shortURL] = {
    longURL,
    userID,
  }

  //console.log('here is the database after the action was performed:    ')
  //console.log(urlDatabase);

  res.redirect(`/urls/${shortURL}`)
});

//logs in
app.get("/login", (req, res) => {
  const templateVars = { 
    user: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars);
})

//updates a URL
app.post("/urls/:id", (req, res) => { 
  //this method receives longURL + short from the .ejs file
  //therefore, we can use the shortURL to find the userID, and then check if it belongs to the logged in user
  if (req.cookies["user_id"] !== getIdByShortURL(req.body.short)) {
    res.send('this url does not belong to you')
    res.redirect("/urls")
  }

  urlDatabase[req.body.short] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  }
  res.redirect(`/urls`)
})

//deletes URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!req.cookies["user_id"]){
    res.redirect("/login");
  }

    //if shortURL does not belong to user
  if (req.cookies["user_id"] !== getIdByShortURL(req.body.short)) {
    res.send('this url does not belong to you')
    res.redirect("/urls")
  }

  console.log(req.params)
  delete urlDatabase[req.params.shortURL]

  console.log('here is the database after the action was performed:    ')
  console.log(urlDatabase);

  res.redirect("/urls")
})

app.post("/login", (req, res) => {
  console.log('POST /login')

  if (!checkEmail(req.body.email)){
    res.status(403);
    res.send('403: Email not found'); 
  } 
  //check password
  //const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (!bcrypt.compareSync(req.body.password, getPasswordByEmail(req.body.email))) {
    res.status(403);
    res.send('403: Incorrect Password'); 
  }

  const id =  getIdByEmail(req.body.email)
  //console.log(id);

  res.cookie('user_id', id)
  //console.log(res.cookie)

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

  //hashing password
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  console.log(hashedPassword)
  //adding to users object 
  users[id] = {
    id: id,
    email: req.body.email,
    password: hashedPassword,
  }
  //add id to cookie 
  res.cookie('user_id', id)


  //console.log(req.cookies.user_id)
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Pavle Gregory Kyril are all listening on port ${PORT}!`);
});