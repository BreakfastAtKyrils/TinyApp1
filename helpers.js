const getIdByEmail = function(email, database) {
  for (const user in database) {
    if (email === database[user].email){
      return database[user].id;
    }
  }
  return undefined;
}

const checkEmail = function(email, database) {
  let emails = [];
  for (const user in database){
    emails.push(database[user].email);
  }
  if (emails.includes(email)){
    return true;
  }
  return false;
}

const generateRandomString = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = '';
  for (let x = 0; x < 6; x++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

 const getIdByShortURL = function(shortURL, database) {
  return database[shortURL].userID;
}

const getPasswordByEmail = function(email, database) {
  for (const user in database) {
    if (email === database[user].email){
      return database[user].password
    }
  }
}

//returns an array with the filtered shortURLs based on the user id
const urlsForUser = function(id, database) {
  let urls = [];

  for (const shortURL in database) {
    if (database[shortURL].userID === id){
      urls.push(shortURL);
    }
  }
  return urls;
}
module.exports = {
  getIdByEmail,
  checkEmail,
  generateRandomString,
  getPasswordByEmail,
  getIdByShortURL,
  urlsForUser
}





