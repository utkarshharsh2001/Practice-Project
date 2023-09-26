const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
}];

const isValid = (username) => { //returns boolean
  const userMatches = users.filter((user) => user.username === username)
  return userMatches.length > 0;
}

const authenticatedUser = (username, password) => {
  // Search for a user with the given username
  const user = users.find((user) => user.username === username);

  // If no user is found with the given username, authentication fails
  if (!user) {
    return false;
  }

  // Compare the provided password with the stored password
  return user.password === password;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
  //Write your code here
  // return res.status(300).json({message: "Yet to be implemented"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;
  console.log("add review: ", req.params, req.body, req.session);
  // Check if the ISBN exists in your books database
  let book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }
  book.reviews[username] = review;
  return res.status(200).json({ message: "Review added/modified successfully." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // Check if the ISBN exists in your books database
  let book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }
  delete book.reviews[username];
  return res.status(200).json({ message: "Review deleted successfully." });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
