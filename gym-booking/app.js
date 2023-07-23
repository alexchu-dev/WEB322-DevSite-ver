/****************  Assignment 5   *****************/
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
app.use(express.static("gym-booking/assets"))
// extract data sent by <form> element in the client
app.use(express.urlencoded({ extended: true }))
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
  username: String,
  password: String,
  userType: String,
})
const User = mongoose.model("a5_users_collection", userSchema)

// Class Schema and model
const classSchema = new Schema({
  imageName: String,
  className: String,
  length: Number,
})
const Class = mongoose.model("a5_classes_collection", classSchema)

// Payment Schema and model
const paymentSchema = new Schema({
  username: String,
  totalAmountPaid: Number,
})
const Payment = mongoose.model("a5_payments_collection", paymentSchema)

// Cart Schema and model
const cartSchema = new Schema({
  username: String,
  classId: String,
})
const Cart = mongoose.model("a5_carts_collection", cartSchema)

// ----------------
// endpoints
// ----------------
// Home Page
app.get("/", async (req, res) => {
  console.log(req.session)
  const loginStatus = req.session.hasLoggedInUser
  try {
    const classList = await Class.find().lean()
    let noClassFound = false
    if (classList.length === 0) {
      noClassFound = true
    }
    res.render("home", {
      layout: "default",
      title: "Home",
      login: loginStatus,
      noClass: noClassFound,
      noClassMsg: "No classes found.",
      username: req.session.username,
      classList: classList,
    })
    return
  } catch (err) {
    console.log(err)
  }
})
// Add Classes
app.post("/add", async (req, res) => {
  console.log(req.session)
  const loginStatus = req.session.hasLoggedInUser
  try {
    const classList = await Class.find().lean()
    // This section is to return an error message when user add class without login
    if (loginStatus === undefined) {
      res.render("home", {
        layout: "default",
        title: "Home",
        nologin: true,
        message:
          'Please <a href="login" class="underline">log in</a> to add class.',
        classList: classList,
      })
      return
    }
    // Add class and temporarily store in database if user have logged in.
    const classFromForm = req.body.classId
    const usernameFromSession = req.session.username
    const classAdded = await Class.findById(classFromForm).lean()
    console.log(classAdded.className)
    const returnMessage = `"${classAdded.className}" was added successfully.`
    // Check again if the input are undefined for some reason.
    if (usernameFromSession !== undefined && classFromForm !== undefined) {
      const cartCreate = Cart({
        username: usernameFromSession,
        classId: classFromForm,
      })
      await cartCreate.save()
    } else {
      res.render("home", {
        layout: "default",
        title: "Home",
        nologin: true,
        message:
          'Please <a href="login" class="underline">log in</a> to add class.',
        classList: classList,
      })
      return
    }
    res.render("home", {
      layout: "default",
      title: "Home",
      login: loginStatus,
      message: returnMessage,
      username: usernameFromSession,
      classList: classList,
    })
    return
  } catch (err) {
    console.log(err)
  }
})
// Cart Page
app.get("/cart", async (req, res) => {
  let emptyCart = false
  const loginStatus = req.session.hasLoggedInUser
  const usernameFromSession = req.session.username
  try {
    const cartList = await Cart.find({ username: usernameFromSession }).lean()
    if (cartList.length === 0) {
      res.render("cart", {
        layout: "default",
        login: loginStatus,
        username: usernameFromSession,
        emptyCart: true,
      })
      return
    }
    let classInCart = []
    let subtotal = 0
    let tax, total
    for (let i = 0; i < cartList.length; ++i) {
      const objId = cartList[i]._id
      const classId = cartList[i].classId
      const classDetail = await Class.findOne({ _id: classId })
      const classToAdd = {}
      classToAdd.objId = objId
      classToAdd.className = classDetail.className
      classToAdd.length = classDetail.length
      classInCart.push(classToAdd)
      subtotal += 25
    }
    const monthlySubscription = await Payment.findOne({
      username: usernameFromSession,
      totalAmountPaid: 75,
    }).lean()
    if (monthlySubscription !== null) {
      subtotal = 75
    }
    tax = subtotal * 0.13
    total = subtotal + tax
    res.render("cart", {
      layout: "default",
      title: "Cart",
      login: loginStatus,
      username: usernameFromSession,
      cartContent: classInCart,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    })
    return
  } catch (err) {
    console.log(err)
  }
})
// Remove item from cart
app.post("/remove-class", async (req, res) => {
  try {
    const cartItemFromForm = req.body.cartItemId
    const cartToDelete = await Cart.deleteOne({ _id: cartItemFromForm })
    console.log(cartToDelete)
    if (cartToDelete.deletedCount > 0) {
    }
    res.redirect("cart")
  } catch (err) {
    console.log(err)
  }
})
// Confirm cart
app.post("/checkout", async (req, res) => {
  const usernameFromSession = req.session.username
  const loginStatus = req.session.hasLoggedInUser
  const totalFromForm = req.body.total
  console.log(`${usernameFromSession} confirms payment of ${totalFromForm}`)
  try {
    if (usernameFromSession !== undefined && totalFromForm !== undefined) {
      const processPayment = await Payment({
        username: usernameFromSession,
        totalAmountPaid: totalFromForm,
      })
      console.log(processPayment)
      await processPayment.save()
      const clearCart = await Cart.deleteMany({
        username: usernameFromSession,
      })
      console.log(`Clear Cart: ${clearCart.deletedCount}`)
      const returnMessage = "Thank you for your payment!"
      res.render("cart", {
        layout: "default",
        title: "Payment Confirm",
        login: loginStatus,
        message: returnMessage,
        username: usernameFromSession,
        paymentDone: true,
      })
      return
    } else {
      res.render("cart", {
        layout: "default",
        title: "Payment Error",
        login: loginStatus,
        username: usernameFromSession,
        paymentError: true,
      })
      return
    }
  } catch (err) {
    console.log(err)
  }
})
app.get("/payments", async (req, res) => {
  try {
    const payment = await Payment.find()
    res.send(payment)
    return
  } catch (err) {
    console.log(err)
  }
})
// Login Page (GET METHOD)
app.get("/login", (req, res) => {
  const usernameFromSession = req.session.username
  console.log(req.session)
  if (usernameFromSession) {
    res.render("login", {
      layout: "default",
      title: "Login",
      login: true,
      redirect: true,
      username: usernameFromSession,
      message: "You have logged in successfully.",
    })
    return
  }
  res.render("login", {
    layout: "default",
    title: "Login",
  })
  return
})
// Login Verification (POST METHOD)
app.post("/login", async (req, res) => {
  console.log(req.session)
  const emailFromForm = req.body.email
  const passwordFromForm = req.body.password
  console.log(`Login attempt: ${emailFromForm} , password: ${passwordFromForm}`)
  try {
    const userExists = await User.findOne({ username: emailFromForm }).lean()
    if (userExists === null) {
      console.log(`Login failed: ${emailFromForm}`)
      res.render("login", {
        layout: "default",
        title: "Login",
        error: true,
        errorMsg: "No account was found.",
      })
      return
    }
    if (userExists.password === passwordFromForm) {
      req.session.hasLoggedInUser = true
      req.session.userType = userExists.userType
      req.session.username = userExists.username
      console.log(req.session)
      const classList = await Class.find().lean()
      res.render("home", {
        layout: "default",
        title: "Home",
        login: true,
        username: req.session.username,
        classList: classList,
      })
      return
    } else {
      res.render("login", {
        layout: "default",
        title: "Login",
        error: true,
        errorMsg: "The email address or password was incorrect.", // This case is for incorrect password
      })
      return
    }
  } catch (err) {
    console.log(err)
  }
})
// Create Account
app.post("/register", async (req, res) => {
  console.log(req.session)
  const emailFromForm = req.body.email
  const passwordFromForm = req.body.password
  const userTypeDefault = "member" // Default type to member, admin type can only be manually assigned.
  console.log(
    `Register attempt: ${emailFromForm}, password: ${passwordFromForm}, userType: ${userTypeDefault},`
  )
  try {
    const userExists = await User.findOne({ username: emailFromForm }).lean()
    if (userExists === null) {
      req.session.tempUser = {
        username: emailFromForm,
        password: passwordFromForm,
        userType: userTypeDefault,
      }
      console.log(
        `Passing parameters to session, username: ${req.session.tempUser.username}, password: ${req.session.tempUser.password}`
      )
      res.render("login", {
        layout: "default",
        title: "Signup",
        newAccount: true,
      })
      return
    } else {
      res.render("login", {
        layout: "default",
        title: "Login",
        error: true,
        errorMsg: "This email is already registered, please try again.",
      })
      return
    }
  } catch (e) {
    console.log(e)
  }
})
// Create Account
app.post("/signup", async (req, res) => {
  console.log(req.session)
  if (req.session !== null) {
    const usernameFromSession = req.session.tempUser.username
    const passwordFromSession = req.session.tempUser.password
    const userTypeFromSession = req.session.tempUser.userType
    const planFromForm = req.body.plan
    console.log(
      `Signup attempt: ${usernameFromSession} , password: ${passwordFromSession}, userType: ${userTypeFromSession}, plan: ${planFromForm}`
    )
    try {
      // Do another check just incase of data injection from session.
      const userExists = await User.findOne({
        username: usernameFromSession,
      }).lean()
      if (userExists === null) {
        const userCreate = User({
          username: usernameFromSession,
          password: passwordFromSession,
          userType: userTypeFromSession,
        })
        await userCreate.save()
        console.log(userCreate)
        console.log(`User created`)
        // If form value is Monthy, then create a payment of $75.
        if (planFromForm === "monthly") {
          const paymentCreate = Payment({
            username: usernameFromSession,
            totalAmountPaid: 75,
          })
          await paymentCreate.save()
          console.log(`Monthly plan payment created.`)
        }
        req.session.hasLoggedInUser = true
        req.session.userType = userCreate.userType
        req.session.username = userCreate.username
        const classList = await Class.find().lean()
        res.render("home", {
          layout: "default",
          title: "Home",
          login: true,
          username: req.session.username,
          userType: req.session.userType,
          newAccount: true,
          classList: classList,
        })
        return
      } else {
        res.render("login", {
          layout: "default",
          title: "Login",
          error: true,
          errorMsg: "This email is already registered, please try again.", // Does not tell user the exact error for security
        })
        return
      }
    } catch (e) {
      console.log(e)
    }
  } else {
    res.render("login", {
      layout: "default",
      title: "Login",
      error: true,
      errorMsg: "Session expired, please try again.", // Does not tell user the exact error for security
    })
    return
  }
})
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
