const { assert } = require('chai');

const getIdByEmail = require('../helpers.js');
const checkEmail = require("../helpers.js")

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getIdByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getIdByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput)
  });
  it('should return undefined when the email that is not in the database', function() {
    const user = getIdByEmail("undefined@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput)
  });
});


