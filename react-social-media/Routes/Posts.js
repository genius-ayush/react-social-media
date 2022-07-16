const express = require('express')
const router = express.Router()
const posts = require('../controllers/posts')


//create post

//timeline posts

router.get('/api/timeline/:id', posts.timelinePost) //have the path with the higher specificity above the path with lesser specificity.

router.post('/api', posts.createPost)

//get post

router.get('/api/:id', posts.getPost)

//update post

router.post('/api/:id', posts.updatePost)

//delete post

router.delete('/api/:id', posts.deletePost)

//like/unlike post

router.post('/like/d/:id', posts.likePost)





module.exports = router;