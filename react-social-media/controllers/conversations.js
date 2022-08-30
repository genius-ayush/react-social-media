const Conversation = require('../models/conversation')

//create a conversation
module.exports.createConversation = async function(req,res){
    try{
        const conversation = new Conversation({
            people: [req.body.senderId, req.body.receiverId]
        })
        await conversation.save()
        res.status(200).json(conversation);
    }catch(err){res.status(500).json(err)}
}

//get all conversations of a user

module.exports.getConversations = async function(req,res){
    try{
        const { userId } = req.params
        const conversations = await Conversation.find({
            people:{ $in : [userId]}
        })
        res.status(200).json(conversations)
    }catch(err){res.status(500).json(err)}
}

//find specific conversation
module.exports.getConversation = async function(req,res){
    try{
        const { userId } = req.params
        const conversations = await Conversation.find({
            people: userId
        })
        res.status(200).json(conversations)
    }catch(err){res.status(500).json(err)}
}
