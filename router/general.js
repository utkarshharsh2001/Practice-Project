const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    // Check if the username already exists in the users array
    const userExists = users.some(user => user.username === username);

    if (!userExists) {
      // Add the new user to the users array
      users.push({ username, password });

      return res.status(200).json({ message: "User successfully registered. Now you can log in." });
    } else {
      return res.status(409).json({ message: "User already exists!" });
    }
  }

  return res.status(400).json({ message: "Unable to register user. Please provide a username and password." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books.length < isbn) {
    return res.status(404).json({ message: "No books found by this isbn." });
  }
  res.status(200).send(books[isbn]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author === author);

  if (booksByAuthor.length === 0) {
    return res.status(404).json({ message: "No books found by this author." });
  }
  return res.status(200).json(booksByAuthor);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter(book => book.title === title);

  if (booksByTitle.length === 0) {
    return res.status(404).json({ message: "No books found by this title." });
  }
  return res.status(200).json(booksByTitle);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books.length < isbn) {
    return res.status(404).json({ message: "No books found by this isbn." });
  }
  res.status(200).send(books[isbn].reviews);
});

function getBookList(){
  return new Promise((resolve,reject)=>{
    resolve(books);
  })
}

public_users.get('/',function(req,res){
  getBookList().then(
    (book)=>res.send(JSON.stringify(book,null,4)),
    (error)=> res.send("denied")
  );
});

function getFromISBN(isbn){
  let book = books[isbn];
  return new Promise((resolve,reject)=>{
    if(book){
      resolve(book);
    }else{
      reject("Unable to find the book")
    }
  })
}

public_users.get('/isbn/:isbn',function(req,res){
  const isbn = req.params.isbn;
  getFromISBN(isbn).then(
    (book)=>res.send(JSON.stringify(book,null,4)),
    (error) => res.send(error)
  )
});

function getFromAuthor(author){
  let result = [];
  return new Promise((resolve,reject)=>{
    for(var isbn in books){
      let book = books[isbn];
      if(book.author===author){
        output.push(book);
      }
    }
    resolve(output);
  })
}

public_users.get('/author/:author',function(req,res){
  const author = req.params.author;
  getFromAuthor(author).then(result=>res.send(JSON.stringify(result,null,4)));
});

function getFromTitle(title){
  let result = [];
  return new Promise((resolve,reject)=>{
    for(var isbn in books){
      let book = books[isbn];
      if(book.title===title){
        output.push(book);
      }
    }
    resolve(output);
  })
}

public_users.get('/title/:title',function(req,res){
  const title = req.params.title;
  getFromTitle(title).then(result=>res.send(JSON.stringify(result,null,4)));
});


module.exports.general = public_users;
