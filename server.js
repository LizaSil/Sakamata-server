const express = require("express")
const cors = require("cors")
const axios = require("axios")

require("dotenv").config("./.env")
const CID = process.env.CHANNEL_ID
const KEY = process.env.API_KEY
const PORT = process.env.PORT || 3000
const URL = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CID}&order=date&key=${KEY}`

var livestatus
var updated
var videoid

const app = express()
app.use(cors())

// Fetch the data with axios
setInterval(() => {
  getData()
}, 864 * 1000)

app.get("/livestream-status", (req, res) => {
  req.header("Access-Control-Allow-Origin")
  res.send({
    status: livestatus,
    updated: updated,
    videoId: videoid,
  })
})

app.listen(PORT, () => {
  getData()
  console.log(`Server running on port ${PORT}`)
})

function getData() {
  console.log("Fetching data...")
  axios.default
    .get(URL)
    .then((results) => {
      //console.log(results.data.items)
      livestatus = results.data.items[0].snippet.liveBroadcastContent
      updated = results.data.items[0].snippet.publishedAt
      videoid = results.data.items[0].id.videoId
    })
    .catch((error) => {
      console.error(error)
    })
}