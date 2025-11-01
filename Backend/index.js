const express = require('express')
const cors = require('cors');
const app = express()
const songs = require('./songsData')

const PORT = 3000
app.use(cors())
app.use(express.json())


app.get("/", (req, res)=>{
    res.send("API is running")
})

app.get("/api/songs", (req, res)=>{
    res.json(songs)
})

app.get("/api/songs/:mood", (req, res)=>{
    const mood = req.params.mood.toLowerCase()
    if(songs[mood]){
        res.json(songs[mood])
    }else{
        res.status(404).json({message:"mood not found"})
    }
})

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`)
})