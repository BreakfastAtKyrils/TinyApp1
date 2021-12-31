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

function generateRandomString() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = '';
  for (let x = 0; x < 6; x++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

//this get method simply renders all the URLs
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"],
 };
  res.render("urls_index", templateVars)
})

//create a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
 };
  res.render("urls_new", templateVars);
});

//displays a specific URL page --> use urls_show.ejs
app.get("/urls/:shortURL", (req, res) => {
  console.log('GET /urls/:shortURL !')

  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
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
  console.log(req.body);  // Log the POST request body to the console
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;

  console.log('here is the database after the action was performed:    ')
  console.log(urlDatabase);

  res.redirect(`/urls/${shortURL}`)
});

//updates a URL
app.post("/urls/:id", (req, res) => { 
  urlDatabase[req.body.short] = req.body.longURL;
  //res.redirect(`/urls/${shortURL}`)
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
  res.clearCookie('username')
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});