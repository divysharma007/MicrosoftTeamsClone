const mongoose = require('mongoose')
const RoomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
        
    },
    discription: {
        type: String,
        required: true
        
    },
    users:[{type:mongoose.Schema.Types.ObjectID,ref:"user"}],
})
const RoomModel = mongoose.model('room', RoomSchema)

module.exports=RoomModel