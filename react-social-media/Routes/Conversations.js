const express = require('express')
const router = express.Router()
const conversations = require('../controllers/conversations.js')


//create conversation
router.post('/', conversations.createConversation)

//get all conversations of user
router.get('/:userId', conversations.getConversations)


router.get('/dm/:userId', conversations.getConversation)











module.exports = router;