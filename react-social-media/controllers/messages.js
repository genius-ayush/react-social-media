const Message = require('../models/Messages')

module.exports.createMessage = async function(req,res){
    try{
        const message = new Message(req.body)
        await message.save()
        res.status(200).send(message)
    }catch(err){res.send(err)}
}

module.exports.findMessage = async function(req,res){
    try{
        const { conversationId } = req.params;
        const messages = await Message.find({conversationId})
        res.send(messages)
    }catch(err){res.send(err)}
}