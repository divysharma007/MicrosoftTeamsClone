const Message = require("../models/Message");

const createmessage=async(username, text, timestr, mail)=>{
    	const newmessage =await  new Message({
				name: username,
				content:text,
				date: timestr,
				mail:mail,
				
        });
    await newmessage.save();
    return newmessage;
}
module.exports = {
    createmessage,
};