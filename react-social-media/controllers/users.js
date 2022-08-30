const User = require('../models/user');
const passport = require('passport');
const crypto = require('crypto')
const { cloudinary } = require('../utils/cloudinary')
const dotenv = require('dotenv').config()




//function for generating hash and salt for user
async function genPassword(password) {
  var salt =  crypto.randomBytes(32).toString("hex");
  var genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return {
    salt: salt,
    hash: genHash,
  };
}

module.exports.createUser = async(req,res) => {
  try{
    //must use await cause genpass needs to finish first or a promise is generated which messes with generating salt and hash variables
    const saltHash = await genPassword(req.body.password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;
    const existingemail = await User.find({email:req.body.email})
    const existingusername = await User.find({username:req.body.username})
    //checks if theres existing user or existing email
    if(!existingusername.length > 0 && !existingemail.length > 0){
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        hash: hash,
        salt: salt,
      });
      await newUser.save();
      res.status(200).send('success')
    }else{
      //since theres existing user and/or pass, sends 404 status
      res.status(404).send('error')
    }
  }catch(err){
    //sends error status if can't create user
    return;
  }
};

//find user based on param passed into url
module.exports.getUser = async(req, res) => {
  try{
      const user = await User.findById(req.params.id)
      res.send(user)
  }catch(err){
    res.status(400).json(err);
  }  
};

//find user based on username
module.exports.getUsername = async(req, res) => {
  try{
    //find a user using case insensitive search. Its not good for scaling (millions of users)
      const user = await User.findOne({username:{ $regex : `^${req.params.username}$`, $options : 'i' }})
      res.send(user)
  }catch(err){
    res.status(400).send(err);
  }  
};

//sends user data if user is stored in req.user from passport, session causes persistence
module.exports.getUserInfo = async(req, res)=>{
  try{
    res.send(req.user)
  }catch(err){res.send(err)}
}

module.exports.updateUser = async(req, res) => {
  try{
      const { id } = req.params;
      const password = req.body.password
      const saltpass = genPassword(password) 
      delete req.body.password
      const user = await User.findByIdAndUpdate(id, { ...req.body, salt: saltpass.salt, hash: saltpass.hash})
      await user.save();
  }catch(e){
      console.log('error in updating user controller');
  }  
};

module.exports.deleteUser = async(req, res) => {
  try{
      const { id } = req.params;
      await User.findByIdAndDelete(id);
      
  }catch(e){
      console.log('error in delete user controller');
  }  
};


//follow and unfollow a user

module.exports.followUser = async(req, res) => {
  //cannot follow yourself validation validation wraps entire function
  if (req.params.id !== req.user.id){
    try{
      const currentUser = await User.findById(req.user.id)
      const followedUser = await User.findById(req.params.id)
      //check to see if you are already following user, otherwise update follower/following counts
        if (!currentUser.followingCount.includes(followedUser.id)){
          await User.findByIdAndUpdate( currentUser.id , { $push: { followingCount:req.params.id } }); 
          await User.findByIdAndUpdate( followedUser.id , { $push: { followerCount:req.user.id } }); 
          res.send('success')
        }else{
          res.send('you already follow this user')
        }
    }catch(e){
      console.log('error in follow user controller')
    }
  }else{
    console.log('you cant follow yourself')
  }
}


module.exports.unfollowUser = async(req,res)=>{
  if (req.params.id !== req.user.id){
    try{
      const currentUser = await User.findById(req.user.id)
      const followedUser = await User.findById(req.params.id)
      if(currentUser.followingCount.includes(followedUser.id)){
        await User.findByIdAndUpdate(currentUser.id, {$pull: { followingCount: followedUser.id}})
        await User.findByIdAndUpdate(followedUser.id, {$pull: { followerCount: currentUser.id}})
        res.send('success')
      }else{
        res.send('you are not following this person')
      }
    }catch(e){
      console.log('error in unfollow user controller')
    }
  }else{
    console.log('you cant unfollow yourself')
  }
}

module.exports.uploadProfilePicture = async(req, res)=>{
  const currentUser = await User.findById(req.user.id)
  const pfp = req.body.profilepic
  const profile = await cloudinary.uploader.upload(pfp, {folder: 'react-social-media'})
  try{
    await currentUser.update({profilePicture:profile.url})
    res.status(200).send('success')
  }catch(err){console.log('error in uploadprofilepicture controller')}
}

module.exports.uploadCoverPicture = async(req, res)=>{
  const currentUser = await User.findById(req.user.id)
  const cvp = req.body.coverpic
  const cover = await cloudinary.uploader.upload(cvp, {folder: 'react-social-media'})
  try{
    await currentUser.update({coverPicture:cover.url})
    res.status(200).send('success')
  }catch(err){console.log('error in uploadcoverpicture controller')}
}