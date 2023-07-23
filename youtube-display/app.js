/****************  Assignment 4   *****************/
/*      Alex Chu (sid:153954219) @ WEB322NAA      */
/**************************************************/
// Set up prerequisite for http and https so I can host node with HTTPS on my server.
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
      timeformat: function (val) {
        return val ? new Date(val).toLocaleDateString() : ""
      },
    },
  })
)
app.set("view engine", ".hbs")
// define a static resources folder
app.use(express.static("youtube-display/assets"))
app.use(express.static(__dirname, { dotfiles: "allow" }))
// extract data sent by <form> element in the client
app.use(express.urlencoded({ extended: true }))

/// --------------
// DATABASE : Connecting to database and setting up your schemas/models (tables)
/// --------------
const mongoose = require("mongoose")
const Schema = mongoose.Schema

// Video Schema and model
const videoSchema = new Schema({
  videoId: { type: String, unique: true },
  title: String,
  channel: String,
  likes: { type: Number, default: 0 },
  image: String,
  uploadDate: String,
})
const Video = mongoose.model("video_collection", videoSchema)

// Comment Schema and model
const commentSchema = new Schema({
  username: String,
  text: String,
  videoId: String,
  commentDate: { type: Date, default: Date.now },
})
const Comment = mongoose.model("comments_collection", commentSchema)

// ----------------
// endpoints
// ----------------
// Home Page
app.get("/", async (req, res) => {
  try {
    const videoList = await Video.find().lean()
    let noVideoFound = false
    if (videoList.length === 0) {
      noVideoFound = true
    }
    res.render("home", {
      layout: "default",
      title: "Home",
      error: noVideoFound,
      errorMsg: "No videos found.",
      videoList: videoList,
    })
    return
  } catch (err) {
    console.log(err)
  }
})
// Video Page
app.get("/video/:vid", async (req, res) => {
  const vidFromURL = req.params.vid
  try {
    const videoFound = await Video.findOne({ videoId: vidFromURL }).lean()
    const commentsList = await Comment.find({ videoId: vidFromURL })
      .sort({ _id: -1 })
      .lean()
    if (!videoFound) {
      res.render("videos", {
        layout: "default",
        error: true,
        errorMsg: "No videos found.",
      })
      return
    } else {
      if (vidFromURL === videoFound.videoId) {
        res.render("videos", {
          layout: "default",
          title: videoFound.title,
          error: false,
          video: videoFound,
          comments: commentsList,
        })
        return
      } else {
        res.render("videos", {
          layout: "default",
          error: true,
          errorMsg: "No videos found.",
        })
        return
      }
    }
  } catch (err) {
    console.log(err)
  }
})
// Search Page
app.get("/search", async (req, res) => {
  const keywords = req.query.keywords
  let videoList = []
  let noVideoFound = false
  try {
    if (keywords) {
      videoList = await Video.find({
        title: { $regex: keywords, $options: "i" },
      }).lean()
      if (videoList.length === 0) {
        // this case is when the keyword doesnt match the database, will return true boolean, trigger below and return an error page.
        noVideoFound = true
      }
    } else {
      // this case is when there is no keyword but user submitted blank, return all results.
      videoList = await Video.find().lean()
    }
    res.render("home", {
      layout: "default",
      title: `Result for ${keywords}`,
      error: noVideoFound,
      errorMsg: "No videos found.",
      videoList: videoList,
    })
    return
  } catch (err) {
    console.log(err)
  }
})
// Like Button using findOneAndUpdate(filter, update, {new: true}) member function.
app.post("/video/:videoId/like", async (req, res) => {
  try {
    const video = await Video.findOneAndUpdate(
      { videoId: req.params.videoId },
      { $inc: { likes: 1 } },
      { new: true }
    ).lean()
    if (video.length === 0) {
      res.send(`ERROR FOUND. Please check console and backend codes.`)
      return
    }
    res.json(video) // The actual display is reflected on the client side script.
    return
  } catch (err) {
    console.log(err)
  }
})
// Adding comment for the video
app.post("/comment", async (req, res) => {
  const { videoId, username, comment } = req.body
  try {
    const newComment = new Comment({
      username: username,
      text: comment,
      videoId: videoId,
    })
    await newComment.save().then(() => {
      res.redirect(`/portfolio/expressjs/youtube-display/video/${videoId}`)
      return
    })
  } catch (err) {
    console.log(err)
  }
})
// Admin page
app.get("/admin", async (req, res) => {
  try {
    const videos = await Video.find().lean()
    if (videos.length === 0) {
      // In case all videos are being deleted during demostration, restore the following database back to MongoDB.
      // Import Videos
      const importVideo = await Video.insertMany([
        {
          videoId: "zxDbeBgeZ74",
          title: "Japanese study english funny",
          channel: "funnylol3565",
          likes: 96,
          image: "https://img.youtube.com/vi/zxDbeBgeZ74/0.jpg",
          uploadDate: "26 Sept 2016",
        },
        {
          videoId: "rqX8PFcOpxA",
          title: "a day in the life of a software engineer",
          channel: "Mayuko",
          likes: 20,
          image: "https://img.youtube.com/vi/rqX8PFcOpxA/0.jpg",
          uploadDate: "17 Jul 2017",
        },
        {
          videoId: "DU0fHIfMT-g",
          title: "Software engineers who lost their jobs chill in a bar",
          channel: "FryingPanLIVEE",
          likes: 8,
          image: "https://img.youtube.com/vi/DU0fHIfMT-g/0.jpg",
          uploadDate: "4 Sept 2022",
        },
        {
          videoId: "hb-2xqEOBCs",
          title: "🎵Luigi's Lament 🎵",
          channel: "Mashed",
          likes: 6,
          image: "https://img.youtube.com/vi/hb-2xqEOBCs/0.jpg",
          uploadDate: "30 Apr 2020",
        },
        {
          videoId: "1tnj3UCkuxU",
          title: "CS50 2021 in HDR - Lecture 0 - Scratch",
          channel: "CS50",
          likes: 20,
          image: "https://img.youtube.com/vi/1tnj3UCkuxU/0.jpg",
          uploadDate: "31 Dec 2021",
        },
        {
          videoId: "sWtEYPva4A0",
          title: "Relaxing Zelda Music with Campfire Ambience",
          channel: "SamCisco",
          likes: 9,
          image: "https://img.youtube.com/vi/sWtEYPva4A0/0.jpg",
          uploadDate: "10 Oct 2021",
        },
        {
          videoId: "fYZuiFDQwQw",
          title:
            "The Legend of Zelda: Tears of the Kingdom Official Trailer #2",
          channel: "NintendoAmerica",
          likes: 8,
          image: "https://img.youtube.com/vi/fYZuiFDQwQw/0.jpg",
          uploadDate: "8 Feb 2023",
        },
      ])
      const importComment = await Comment.insertMany([
        {
          username: "alex",
          text: "test\r\n",
          videoId: "zxDbeBgeZ74",
          commentDate: "2023-03-25T02:02:09.427Z",
        },
        {
          username: "Naruto",
          text: "This guy is hilarius!! lmao",
          videoId: "zxDbeBgeZ74",
          commentDate: "2023-03-25T03:58:25.956Z",
        },
        {
          username: "Dr. Ten",
          text: "Ten Ten Ten Ten Ten Ten Ten Ten Ten Ten ",
          videoId: "zxDbeBgeZ74",
          commentDate: "2023-03-25T03:58:37.389Z",
        },
        {
          username: "SE wannabe",
          text: "Gonna love this vibe.",
          videoId: "rqX8PFcOpxA",
          commentDate: "2023-03-25T04:00:05.160Z",
        },
        {
          username: "PanPan",
          text: "Hello there",
          videoId: "DU0fHIfMT-g",
          commentDate: "2023-03-25T04:00:23.001Z",
        },
        {
          username: "Wario",
          text: "MEEHH",
          videoId: "hb-2xqEOBCs",
          commentDate: "2023-03-25T04:00:36.232Z",
        },
        {
          username: "CS50 student",
          text: "this is my fav course",
          videoId: "1tnj3UCkuxU",
          commentDate: "2023-03-25T04:00:50.263Z",
        },
        {
          username: "Linku",
          text: "I sleep with this music",
          videoId: "sWtEYPva4A0",
          commentDate: "2023-03-25T04:01:11.538Z",
        },
        {
          username: "Linku",
          text: "I sleep with this music",
          videoId: "sWtEYPva4A0",
          commentDate: "2023-03-25T04:01:11.640Z",
        },
        {
          username: "omg",
          text: "gonna buy this",
          videoId: "fYZuiFDQwQw",
          commentDate: "2023-03-25T04:01:28.525Z",
        },
        {
          username: "the guy",
          text: "yooooo",
          videoId: "zxDbeBgeZ74",
          commentDate: "2023-03-25T17:01:49.289Z",
        },
      ])
      console.log(importVideo.length, importComment.length)
      res.render("admin", {
        layout: "default",
        error: true,
        errorMsg:
          "No videos found. Auto restore will be commenced after reload.",
      })
      return
    }
    const videoList = []
    for (const video of videos) {
      const commentsCount = await Comment.countDocuments({
        videoId: video.videoId,
      })
      videoList.push({
        _id: video._id,
        videoId: video.videoId,
        title: video.title,
        likes: video.likes,
        commentsCount: commentsCount,
      })
    }
    res.render("admin", {
      layout: "default",
      title: "Admin Panel",
      videoList: videoList,
    })
    return
  } catch (err) {
    console.log(err)
  }
})
// Admin delete action
app.post("/admin/delete", async (req, res) => {
  const videoIdFromForm = req.body.videoId
  try {
    const videoToDelete = await Video.findById({ _id: videoIdFromForm })
    if (videoToDelete.length === 0) {
      res.send(`ERROR FOUND: VideoID unmatched or not found.`)
      return
    }
    const resultComments = await Comment.deleteMany({
      videoId: videoToDelete.videoId,
    })
    console.log(`Delete Comment: ${resultComments.deletedCount}`)
    const resultVideo = await Video.deleteOne({ _id: videoIdFromForm }).then(
      () => {
        res.redirect("/portfolio/youtube-display/admin/")
        return
      }
    )
  } catch (err) {
    console.log(err)
  }
})
// ----------------
module.exports = app
