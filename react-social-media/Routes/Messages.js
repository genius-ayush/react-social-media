const express = require('express')
const router = express.Router()
const messages = require('../controllers/messages.js')



router.post('/', messages.createMessage)
router.get('/:conversationId', messages.findMessage)


module.exports = router;