const express = require('express')
const router = express.Router()
const room = require('../models/Room')
const user = require("../models/User");
const server = require('../index.js')
module.exports = router
const { v4: uuidV4 } = require("uuid");
router.get('/', async (req, res) => {
    
    try {
        const all_rooms = await room.find()
        // console.log(all_rooms)
        const data = req.session.userdata
        console.log(data)
        
        res.render('home',{'rooms': all_rooms})
    } catch (err) {
        res.send('Error' + err)
    }
    
})

router.post('/', async(req, res) => {
    
    const newroom = new room({
        name: req.body.name,
        discription:req.body.discription
    })
    console.log(req.body)
    try {
        const rm = await newroom.save()
        res.send(rm)
    } catch (err) {
        res.send('Error' + err)
    }
  
})

router.get("/:id/video/", (req, res) => {
    console.log(req.params.id)
	res.redirect(`./${uuidV4()}`);
});




router.get("/:id/video/:video", async (req, res) => {
    console.log(req.params.video);
    res.render("video-room", { roomId: req.params.video});
});

router.get("/:id/", async (req, res) => {
	single_room = await room.findById(req.params.id);
	console.log(single_room);
	res.render("room", { room: single_room });
});
