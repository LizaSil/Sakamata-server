const express = require("express")
const cors = require("cors")
const axios = require("axios")
const app = express()

const CID = process.env.CHANNEL_ID
const KEY = process.env.API_KEY
const PORT = process.env.PORT || 3000
const CLIENT = "https://lizasil.github.io/Sakamata"

let updated
let endTime
let videoId
let livestreamStatus

async function fetchData() {
  console.log(
    "Fetched" + new Date().toLocaleDateString("en-US", { timeZone: "Europe/Berlin" })
  )
  try {
    const results = await axios.default.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CID}&maxResults=1&order=date&type=video&key=${KEY}&orign=${CLIENT}`
    )

    const items = results.data.items
    const liveItem = items.find((item) => item.snippet.liveBroadcastContent === "live")
    if (liveItem) {
      livestreamStatus = liveItem.snippet.liveBroadcastContent
      videoId = liveItem.id.videoId
    } else {
      livestreamStatus = items[0].snippet.liveBroadcastContent
      videoId = items[0].id.videoId
    }

    if (livestreamStatus !== "live") {
      updated = await fetchEndTime()
    } else {
      updated = null
    }
  } catch (error) {
    console.error(error)
  }
}

async function fetchEndTime() {
  try {
    const endTimeResults = await axios.get(
      `https://youtube.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${KEY}`
    )
    endTime = endTimeResults.data.items[0].liveStreamingDetails.actualEndTime
    return endTime
  } catch (error) {
    return "Live"
  }
}

app.use(
  cors({
    "Access-Control-Allow-Origin": "*",
    methods: ["GET"],
    allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Origin: *"],
    optionsSuccessStatus: 200,
  })
)

app.get("/livestream-status", async (req, res) => {
  try {
    if (livestreamStatus === "live") {
      updated = "Stream is Live"
    }
    res.send({
      livestreamStatus,
      videoId,
      updated,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send({ error: "Failed to fetch data" })
  }
})

app.listen(PORT, () => {
  fetchData()
  console.log(`Server running on port ${PORT}`)
})

setInterval(() => {
  fetchData()
  // ~ 15 minutes interval
}, 14.8 * 60 * 1000)
