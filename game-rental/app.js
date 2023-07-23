/****************  Assignment 3   *****************/
/*      Alex Chu (sid:153954219) @ WEB322NAA      */
/**************************************************/
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
      /**** Self-defined custom Handlebars helper ****/
      randomEach: (context, size, options) => {
        let tempList = []
        while (tempList.length < size) {
          let randIndex = Math.floor(Math.random() * context.length)
          if (!tempList.includes(context[randIndex])) {
            tempList.push(context[randIndex])
          }
        }
        let ret = ""
        for (let i = 0, j = tempList.length; i < j; i++) {
          ret = ret + options.fn(tempList[i])
        }
        return ret
      },
    },
  })
)
app.set("view engine", ".hbs")

// define a static resources folder
app.use(express.static("game-rental/assets"))
global.appRoot = path.resolve(__dirname)

// extract data sent by <form> element in the client
app.use(express.urlencoded({ extended: true }))
/******************************************************/
// object literal data storage
/******************************************************/
const itemsList = [
  {
    name: "Nintendo Switch - OLED",
    pid: "swcs",
    img: "switch-console-1.avif",
    desc: `Introducing the newest member of the Nintendo Switch family! Play at home on the TV or on-the-go with a vibrant 7-inch OLED screen with the Nintendo Switch™ system - OLED model.`,
    minPeriod: 30,
    availability: true,
  },
  {
    name: "Fall Guys",
    pid: "flgy",
    img: "fallguys.avif",
    minPeriod: 7,
    availability: true,
  },
  {
    name: "It Takes Two",
    pid: "ittt",
    img: "it-takes-two.avif",
    desc: `Embark on the craziest journey of your life in It Takes Two, a genre-bending platform adventure created purely for co-op. Invite a friend to join for free with Friend’s Pass* and work together across a huge variety of gleefully disruptive gameplay challenges.`,
    minPeriod: 14,
    availability: true,
  },
  {
    name: "New Super Mario Bros.™ U Deluxe",
    pid: "madx",
    img: "mario-deluxe.avif",
    minPeriod: 7,
    availability: true,
  },
  {
    name: "Super Mario Odyssey™",
    pid: "maod",
    img: "mario-odyssey.avif",
    minPeriod: 14,
    availability: true,
  },
  {
    name: "Super Nintendo Entertainment System Controller",
    pid: "sncn",
    img: "snes-controller.avif",
    minPeriod: 30,
    availability: true,
  },
  {
    name: "Nintendo Switch™ Sports",
    pid: "swsp",
    img: "switch-sports.avif",
    desc: `Get moving with Golf, Soccer, Volleyball, Bowling, Tennis, Badminton, and Chambara (swordplay) using Joy-Con™ controllers! Controls are intuitive, so you can hit the court (or lanes, or field, or arena) and get started. With controlled motions, you can curve your bowling ball, add spin to a tennis shot, or even use a Joy-Con with the Leg Strap accessory to kick the ball in Soccer. Family and friends can join in on the fun on the same system or online.`,
    minPeriod: 14,
    availability: true,
  },
  {
    name: "The Legend of Zelda™: Breath of the Wild",
    pid: "zeld",
    img: "zelda.avif",
    minPeriod: 7,
    availability: true,
  },
]

// ----------------
// endpoints
// ----------------
app.get("/", (req, res) => {
  res.render("home", {
    layout: "default",
    title: "Home",
    itemsList: itemsList,
  })
})
app.get("/all", (req, res) => {
  res.render("all", {
    layout: "default-breadcrumb",
    title: "All Items",
    itemsList: itemsList,
  })
})
app.get("/product/:pid", (req, res) => {
  const pidFromURL = req.params.pid
  for (let i = 0; i < itemsList.length; i++) {
    if (pidFromURL === itemsList[i].pid) {
      res.render("products", {
        layout: "default-breadcrumb",
        title: itemsList[i].name,
        products: true,
        game: itemsList[i],
      })
    }
  }
})
app.post("/rent", (req, res) => {
  const periodFromForm = req.body.rentPeriod
  const pidFromForm = req.body.pid
  for (let i = 0; i < itemsList.length; i++) {
    if (itemsList[i].pid === pidFromForm) {
      if (periodFromForm >= itemsList[i].minPeriod) {
        itemsList[i].availability = false
        return res.render("all", {
          layout: "default-breadcrumb",
          title: "All Items",
          itemsList: itemsList,
          msg: `You have rented ${itemsList[i].name} successfully!`,
        })
      } else {
        return res.render("error", {
          layout: "default-breadcrumb",
          title: "Error",
          errorMsg: "You did not meet the minimum rental period.",
        })
      }
    }
  }
})
app.get("/return", (req, res) => {
  let found = false
  for (let i = 0; i < itemsList.length; i++) {
    if (itemsList[i].availability === false) {
      itemsList[i].availability = true
      found = true
    }
  }
  if (found) {
    return res.redirect("all")
  } else {
    return res.render("error", {
      layout: "default-breadcrumb",
      title: "Error",
      errorMsg: "You do not have items to return.",
    })
  }
})
app.post("/filter", (req, res) => {
  const result = req.body.results
  let availList = []
  let myRentalList = []
  let retList = []
  for (let i = 0; i < itemsList.length; i++) {
    if (itemsList[i].availability === true) {
      availList.push(itemsList[i])
    } else {
      myRentalList.push(itemsList[i])
    }
  }
  if (result === "available") {
    retList = JSON.parse(JSON.stringify(availList))
    if (retList.length <= 0) {
      return res.render("error", {
        layout: "default-breadcrumb",
        title: "Error",
        errorMsg: "There are no item is available for rent.",
      })
    }
  } else if (result === "my-rentals") {
    retList = JSON.parse(JSON.stringify(myRentalList))
    if (retList.length <= 0) {
      return res.render("error", {
        layout: "default-breadcrumb",
        title: "Error",
        errorMsg: "You do not have item rented.",
      })
    }
  }
  return res.render("all", {
    layout: "default-breadcrumb",
    title: "All Items",
    itemsList: retList,
    msg: "",
  })
})

app.post("/search", (req, res) => {
  const keyword = req.body.toSearch.toLowerCase()
  let indexes = itemsList
    .map((elm, idx) => (elm.name.toLowerCase().includes(keyword) ? idx : ""))
    .filter(String)
  console.log(indexes)
  let tempList = []
  let idxItem
  for (let i = 0; i < indexes.length; i++) {
    tempList.push(itemsList[indexes[i]])
  }
  if (tempList.length > 0) {
    return res.render("all", {
      layout: "default-breadcrumb",
      title: "Search Results",
      itemsList: tempList,
      msg: "",
    })
  } else {
    return res.render("error", {
      layout: "default-breadcrumb",
      title: "Error",
      errorMsg: "No results found.",
    })
  }
})

module.exports = app
