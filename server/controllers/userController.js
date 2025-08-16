import imagekit from '../configs/imagekit.js';
import Connection from '../models/Connection.js';
import User from "../models/User.js";
import fs from 'fs';

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// update User data
export const updateUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
        let {username, bio, location, full_name} =req.body;
        const tempUser = await User.findById(userId);
        !username && (username=tempUser.username)

        if(tempUser.username !== username){
            const user = await User.findOne({username});
            if(user){
                //we will not change the username if it already taken
                username = tempUser.username;
            }
        }
        const updatedData = {
            username,
            bio,
            location,
            full_name
        }
        const profile= req.files.profile && req.files.profile[0]
        const cover =req.files.cover && req.files.cover[0]

        
        
        if(cover){
            const buffer = fs.readFileSync(cover.path);
            const response = await imagekit.upload({
                file: buffer,
                fileName: cover.originalname
            })
            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    {quality: "auto"},
                    {format: "webp"},
                    {width: '1280'}
                ]
            })
            updatedData.cover_picture = url;
        }
        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        res.status(200).json({ success: true, message: 'User data updated successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

//find user using username,email,location,name

export const discoverUsers= async (req, res) => {
    try{
        const {userId} = req.auth();
        const {input} = req.body;

        const allUsers = await User.find({
            $or: [
                { username: new RegExp(input, 'i') },
                { email: new RegExp(input, 'i') },
                { location: new RegExp(input, 'i') },
                { full_name: new RegExp(input, 'i') }
            ]
        });

        const filteredUsers = allUsers.filter(user => user._id !== userId);

        res.status(200).json({ success: true, users: filteredUsers });

    }catch(error){
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

//follow users
export const followUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);

        if (user.following.includes(id)) {
            return res.status(400).json({ success: false, message: 'You are already following this user' });
        }

        user.following.push(id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.followers.push(userId);
        await toUser.save();

        res.status(200).json({ success: true, message: 'User followed successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

// unfollow user
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);

        user.following = user.following.filter(user => user !== id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.followers = toUser.followers.filter(user => user !== userId);
        await toUser.save();

        res.status(200).json({ success: true, message: 'User unfollowed successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

//send connection request
export const sendConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const last24hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const connectionRequests = await Connection.find({
            from_user_id: userId,
            to_user_id: id,
            createdAt: { $gte: last24hours }
        });

        if (connectionRequests.length >= 20) {
            return res.status(400).json({ success: false, message: 'Connection request already sent' });
        }

        const connection = await connection.findOne({
            $or: [
                { from_user_id: userId, to_user_id: id },
                { from_user_id: id, to_user_id: userId }
            ]
        })

        if(!connection){
            await connection.create({
                from_user_id: userId,
                to_user_id: id
            })
            return res.status(201).json({ success: true, message: 'Connection request sent successfully' });
        }else if(connection && connection.status === 'accepted') {
            return res.status(200).json({ success: false, message: 'Connection request already accepted' });
        }
        return res.status(200).json({ success: false, message: 'Connection request already sent' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

//get user connection
export const getUserConnections = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId).populate('connections followers following');

        const connections = user.connections
        const followers = user.followers
        const following = user.following

        const pendingConnections = (await Connection.find({
            from_user_id: userId,
            status: 'pending'
        }).populate('from_user_id')).map(connection=>connection.from_user_id)

        res.status(200).json({ success: true, connections, followers, following, pendingConnections });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

//Accept the connection request
export const acceptConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const connection = await Connection.findOne({
            from_user_id: id,
            to_user_id: userId
        });

        if (!connection) {
            return res.status(404).json({ success: false, message: 'Connection request not found' });
        }
        const user = await User.findById(userId);
        user.connections.push(id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.connections.push(userId);
        await toUser.save();

        connection.status = 'accepted';
        await connection.save();

        res.status(200).json({ success: true, message: 'Connection request accepted' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
}
