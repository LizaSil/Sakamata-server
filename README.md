# Sakamata Server

This code is a simple Express.js server that fetches data from the YouTube API and returns the current status of a livestream which is used by the [client](https://lizasil.github.io/Sakamata/).

## Dependencies

- express
- cors
- axios

## Environment Variables

`CHANNEL_ID`: the YouTube channel ID of the livestream

`API_KEY`: a YouTube API key with access to the YouTube Data API v3

`PORT`: the port the server will run on (defaults to 3000)

## Endpoints

`GET /livestream-status`: returns JSON data with the current status of the livestream, the video ID of the livestream, and the time it was last updated. If the stream is live, the `updated` field will be null. If the stream is not live, the `updated` field will be the time the stream ended.

## Note

The server will automatically fetch data every 15 minutes. This interval can be adjusted by changing the time value in the `setInterval()` function in the code.

## Host

Hosted on Render https://sakamata-api.onrender.com/livestream-status
