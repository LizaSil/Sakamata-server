const express = require("express")
const cors = require("cors")
const axios = require("axios")
require("dotenv").config()
const app = express()

const CID = process.env.CHANNEL_ID
const KEY = process.env.API_KEY
const PORT = process.env.PORT || 3000
const CLIENT = "https://lizasil.github.io/Sakamata"

let data

async function fetchData() {
  console.log(
    "Fetched " +
      new Date().getHours() +
      ":" +
      new Date().getMinutes() +
      ":" +
      new Date().getSeconds()
  )
  try {
    const results = await axios.default.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CID}&channelType=any&order=date&type=video&videoCaption=any&videoDefinition=any&videoDimension=any&videoDuration=any&videoEmbeddable=any&videoLicense=any&videoSyndicated=any&videoType=any&key=${KEY}&origin=${CLIENT}`
    )

    const items = results.data.items
    const liveItem = items.find((item) => item.snippet.liveBroadcastContent === "live")
    if (liveItem) {
      const livestreamStatus = liveItem.snippet.liveBroadcastContent
      const videoId = liveItem.id.videoId
      data = { livestreamStatus, videoId, updated: "Stream is Live" }
      console.log(liveItem)
    } else {
      items.sort((a, b) => {
        return new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
      })
      const videoId = items[0].id.videoId
      const livestreamStatus = items[0].snippet.liveBroadcastContent
      const endTime = await fetchEndTime(videoId)
      data = { livestreamStatus, videoId, updated: endTime }
    }
  } catch (error) {
    console.error(error)
  }
}

async function fetchEndTime(videoId) {
  try {
    const endTimeResults = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${KEY}`
    )
    return endTimeResults.data.items[0].liveStreamingDetails.actualEndTime
  } catch (error) {
    console.error(error.message)
    return "live"
  }
}

app.use(
  cors({
    origin: "*",
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
)

app.get("/", (req, res) => {
  res.redirect("/livestream-status")
})

app.get("/livestream-status", async (req, res) => {
  try {
    if (data) {
      res.send(data)
    } else {
      await fetchData()
      res.send(data)
    }
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: "Failed to fetch data" })
  }
})
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

setInterval(fetchData, 14.8 * 60 * 1000)
