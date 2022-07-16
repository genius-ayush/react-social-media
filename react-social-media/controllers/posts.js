const Post = require('../models/post')
const User = require('../models/user')
const { cloudinary } = require('../utils/cloudinary')
const dotenv = require('dotenv').config()


//create post
module.exports.createPost = async function(req,res){
    const currentUser = req.body.userId
    const image= req.body.data
    const description = req.body.description
    const upload = await cloudinary.uploader.upload(image, {folder: 'react-social-media'}) //uploaded to cloudinary server under specific folder
    const newPost = new Post({
        userId:currentUser,
        description:description,
        img:upload.url,
    })
    try{
        await newPost.save()
        res.send(newPost)
    }catch(e){
        console.log('error in create post controller')
    }
}

//get feed posts for current user
module.exports.getPost = async function(req, res){
    try{
        const post = await Post.find({userId:req.params.id})
        res.send(post)
    }catch(e){
        console.log('error in getpost controller')
    }
}

//update post for current user
module.exports.updatePost = async (req, res) => {
    try {
        const currentUser = req.body.userId
        const post = await Post.findById(req.params.id)
        if (currentUser == post.userId) {
            await Post.findByIdAndUpdate(req.params.id,{$set: req.body})
        } else {
            console.log('you can only update your posts')
        }
    } catch (e) {
        console.log('error in updatepost controller')
    }
}

//delete post for current user
module.exports.deletePost = async (req, res) =>{
    try{
        const currentUser = req.body.userId
        const post = await Post.findById(req.params.id)
        const { id } = req.params
        if(currentUser == post.userId){
            await Post.findByIdAndRemove(req.params.id)
            res.send('success')
        }else{
            console.log('you cannot delete someone elses post')
        }
    }catch(e){
        console.log('error in deletepost controller')
    }
}

//like and dislike post
module.exports.likePost = async(req, res)=>{
    const post = await Post.findById(req.params.id)
    try{
      if (!post.likes.includes(req.body.userId)){
        await post.update({ $push: { likes: req.body.userId}})
        //res.send('post has been liked')
      }else{
        await post.update({$pull: {likes: req.body.userId}})
       //res.send('post has been disliked')
      }
    }catch(err){console.log('error in likepost controller')}
  }




//timeline posts
module.exports.timelinePost = async(req, res)=>{
    try{
        const currentUser = await User.findById(req.params.id);
        const userPosts = await Post.find({userId:req.params.id})
        //promise.all accepts array of promises (from multiple .find queries on Post data), returning single promise. pass await to resolve the promise
        const friendposts = await Promise.all(
            currentUser.followerCount.map(friendId=>{
                return Post.find({ userId:friendId })
            }
        ))
        res.send(userPosts.concat(...friendposts))
    }catch(e){console.log('error in timeline controller')}
    
}

