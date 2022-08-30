const express = require('express');
const router = express.Router();
const user = require('../controllers/users.js');
const connectEnsureLogin = require('connect-ensure-login');// authorization
const passport = require('passport')



//user CRUD routes
router.get('/api/username/:username', user.getUsername)
router.get('/:id', user.getUser)
router.post('/:id', user.updateUser);
router.delete('/:id', user.deleteUser);
router.get('/api/info', user.getUserInfo)


router.put('/profilepic', user.uploadProfilePicture)
router.put('/coverpic', user.uploadCoverPicture)


//register routes
router.post("/api/register", user.createUser)

router.get('/api/register', (req,res)=>{
  res.render('register')
})


//login and logout routes
router.get('/api/login', function(req, res) {
  res.render('login')
});

//login route, if successful login user is stored in req.user
router.post('/api/login', passport.authenticate('local'), (req,res)=>{
  res.send(req.user)
})


router.get('/api/logout', function (req,res){
    req.logout();
    res.redirect('/login')
});


//follow and unfollow routes
router.put('/api/:id/follow', user.followUser)
router.put('/api/:id/unfollow', user.unfollowUser)

module.exports = router;














