const express = require("express")
const app = express()
const path = require("path")
const port = process.env.PORT || 3001
require("dotenv").config()
app.use("/css", express.static(__dirname + "/assets/css"))
app.use("/img", express.static(__dirname + "/assets/img"))

// extract data sent by <form> element in the client

const mongoose = require("mongoose")
mongoose.connect(process.env.MONGODB_CONN_STRING)

//------------
// Endpoints
//------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})
app.get("/portfolio/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"))
})
app.use("/portfolio/expressjs/game-rental", require("./game-rental"))
app.use("/portfolio/expressjs/gym-booking", require("./gym-booking"))
app.use("/portfolio/expressjs/youtube-display", require("./youtube-display"))
app.use("/portfolio/expressjs/library-app", require("./library-app"))
app.listen(port, () => {
  console.log(`Server is running at port ${port}`)
})
module.exports = mongoose
