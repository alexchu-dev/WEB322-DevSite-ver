/****************  Assignment 6   *****************/
/*      Alex Chu (sid:153954219) @ WEB322NAA      */
/**************************************************/
// Express config
const express = require("express")
const app = express()
const exphbs = require("express-handlebars")
const path = require("path")
app.set("views", path.join(__dirname, "views"))
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    helpers: {
      /** JSON helper **/
      json: (context) => {
        return JSON.stringify(context)
      },
    },
  })
)
app.set("view engine", ".hbs")
// define a static resources folder
app.use(express.static("library-app/assets"))
// extract data sent by <form> element in the client
app.use(express.urlencoded({ extended: true }))
// Session configs
const session = require("express-session")
app.use(
  session({
    secret: "the quick brown fox jumped over the lazy dog 1234567890", // random string, used for configuring the session
    resave: false,
    saveUninitialized: true,
  })
)
/// --------------
// DATABASE : Connecting to database and setting up your schemas/models (tables)
/// --------------
const mongoose = require("mongoose")

const Schema = mongoose.Schema

// User Schema and model
const userSchema = new Schema({
  libCardNum: String,
})
const User = mongoose.model("a6_users_collection", userSchema)

// Class Schema and model
const bookSchema = new Schema({
  author: String,
  title: String,
  borrowBy: String,
  img: String,
  desc: String,
})
const Book = mongoose.model("a6_books_collection", bookSchema)

// ----------------
// endpoints
// ----------------
// Home Page
app.get("/", async (req, res) => {
  console.log(req.session)
  const loginStatus = req.session.hasLoggedInUser
  const cardNumber = req.session.cardNumber
  try {
    const bookList = await Book.find().lean()
    if (bookList.length === 0) {
      res.render("error", {
        layout: "default",
        title: "Error",
        error: true,
        errorMsg: "No books in the library.",
      })
      return
    }
    res.render("home", {
      layout: "default",
      title: "Home",
      login: loginStatus,
      username: cardNumber,
      bookList: bookList,
    })
    return
  } catch (err) {
    console.log(err)
  }
})

// Login Page (GET METHOD)
app.get("/login", (req, res) => {
  console.log(req.session)
  res.render("login", {
    layout: "default",
    title: "Login",
  })
  return
})
// Login Verification (POST METHOD)
app.post("/login", async (req, res) => {
  const cardNumber = req.body.cardnumber
  console.log(`Login attempt: ${cardNumber}`)
  try {
    const userExists = await User.findOne({ libCardNum: cardNumber }).lean()
    if (userExists === null) {
      res.render("error", {
        layout: "default",
        title: "Error",
        errorMsg: "No account was found.",
      })
      return
    } else {
      req.session.hasLoggedInUser = true
      req.session.cardNumber = userExists.libCardNum
      res.redirect("/library-app")
      return
    }
  } catch (err) {
    console.log(err)
  }
})
// Profile endpoint
app.get("/profile", async (req, res) => {
  console.log(req.session)
  const loginStatus = req.session.hasLoggedInUser
  const cardNumber = req.session.cardNumber
  let emptyList = false
  try {
    if (loginStatus) {
      const bookList = await Book.find({ borrowBy: cardNumber }).lean()
      if (bookList.length === 0) {
        emptyList = true
      }
      res.render("profile", {
        layout: "default",
        title: "Profile",
        login: loginStatus,
        username: cardNumber,
        bookList: bookList,
        emptyList: emptyList,
      })
      return
    } else {
      res.render("error", {
        layout: "default",
        title: "Error",
        errorMsg: "ERROR: You must be logged in to view this page.",
      })
      return
    }
  } catch (err) {
    console.log(err)
  }
})
// Borrow Books
app.post("/borrow", async (req, res) => {
  console.log(req.session)
  const loginStatus = req.session.hasLoggedInUser
  const cardNumber = req.session.cardNumber
  const bookId = req.body.borrow
  try {
    if (loginStatus) {
      const borrowBook = await Book.findOneAndUpdate(
        { _id: bookId },
        { borrowBy: cardNumber }
      )
      res.redirect("/library-app")
      return
    } else {
      res.render("error", {
        layout: "default",
        title: "Error",
        errorMsg: "ERROR: You must be logged in to complete this operation.",
      })
      return
    }
  } catch (err) {
    console.log(err)
  }
})
// Return Book
app.post("/return-book", async (req, res) => {
  try {
    const loginStatus = req.session.hasLoggedInUser
    const cardNumber = req.session.cardNumber
    let emptyList = false
    const bookIdFromForm = req.body.returnBookId
    const bookToReturn = await Book.findById(bookIdFromForm)
    bookToReturn.borrowBy = ""
    await bookToReturn.save()
    const bookList = await Book.find({ borrowBy: cardNumber }).lean()
    if (bookList.length === 0) {
      emptyList = true
    }
    if (bookToReturn) {
      res.render("profile", {
        layout: "default",
        title: "Profile",
        login: loginStatus,
        username: cardNumber,
        bookList: bookList,
        emptyList: emptyList,
        returnSuccessful: true,
        bookTitle: bookToReturn.title,
      })
      return
    } else {
      res.render("error", {
        layout: "default",
        title: "Error",
        errorMsg: "ERROR: No book was returned.",
      })
      return
    }
  } catch (err) {
    console.log(err)
  }
})
// Log out
app.get("/logout", (req, res) => {
  req.session.destroy()
  console.log(req.session)
  console.log(`Attempt to logout.`)
  res.render("login", {
    layout: "default",
    title: "Login",
    logout: true,
    message: "You have logged out successfully.",
  })
  return
})
// ----------------

module.exports = app
