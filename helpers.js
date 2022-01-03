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
//module.exports = getIdByEmail;
//module.exports = checkEmail;

module.exports = {
  getIdByEmail,
  checkEmail,
}





