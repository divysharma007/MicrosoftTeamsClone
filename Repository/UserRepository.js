const User = require("../models/User");
// gets User with id and populate Teams
const getuserwithrooms = async(email) => {
    	const user = await User.findOne({
				mail: email,
        }).populate("rooms");
    return user;
}
// gets User with id 
 const getuser = async (email) => {
    const user = await User.findOne({
        mail: email,
    });
    return user;
}
// get all Users
 const getallusers = async () => {
    const users = await User.find();
    return users;
}
module.exports = {
	getuser,
	getallusers,
	getuserwithrooms,
};