const { assert } = require('chai');
const { getIdByEmail, checkEmail, generateRandomString, getPasswordByEmail, getIdByShortURL, urlsForUser } = require("../helpers.js")


const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "greg@gmail.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google1.com", userID: "greg_user_id" },
  "short1": { longURL: "http://www.google2.com", userID: "greg_user_id" },
  "short2": { longURL: "http://www.google3.com", userID: "greg_user_id" },
};

describe('getIdByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getIdByEmail("greg@gmail.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput)
  });
  it('should return undefined when the email that is not in the database', function() {
    const user = getIdByEmail("undefined@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput)
  });
});

describe ('checkEmail', function() {
  it('should return true if email is in the user database', function() {
    const check = checkEmail('greg@gmail.com', testUsers);
    const expectedOutput = true;
    assert.equal(check, expectedOutput)
  });
  it('should return false if email is not in the user database', function() {
    const check = checkEmail('greg_false@gmail.com', testUsers);
    const expectedOutput = false;
    assert.equal(check, expectedOutput)
  });
});

describe('getIdByShortURL', function() {
  it('should return the user who owns the URL', function() {
    const id = getIdByShortURL("b2xVn2", testDatabase)
    const expectedOutput = "userRandomID";
    assert.equal(id, expectedOutput)
  });
  it('should return undefined if the URL is not in the database', function() {
    const id = getIdByShortURL("b2xVn2", testDatabase)
    const expectedOutput = "userRandomID";
    assert.equal(id, expectedOutput)
  });
});

describe('getPasswordByEmail', function() {
  it('should return the password for the user', function() {
    const password = getPasswordByEmail("greg@gmail.com", testUsers)
    const expectedOutput = "purple-monkey-dinosaur";
    assert.equal(password, expectedOutput)
  });
  it('should return undefined if the email is not in the database', function() {
    const password = getPasswordByEmail("wrong_email@gmail.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(password, expectedOutput)
  });
});

describe('urlsForUser', function() {
  it('should return the URLs the user owns', function() {
    const urls = urlsForUser("greg_user_id", testDatabase)
    const expectedOutput = ['9sm5xK', 'short1', 'short2'];
    assert.deepEqual(urls, expectedOutput)
  });
  it('should return empty array if email has no URLs', function() {
    const urls = urlsForUser("wrong_email@gmail.com", testDatabase)
    const expectedOutput = [];
    assert.deepEqual(urls, expectedOutput)
  });
});

