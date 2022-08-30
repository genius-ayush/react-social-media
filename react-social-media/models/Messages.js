const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    //each message will be linked to a unique conversation
    conversationId: {
        type: String,
    },
    messagetext: {
        type: String,
    },
    //each message needs to have sender, so ui can distinguish owner and style message accordingly
    sender:{
        type: String,
    },
},
    {timestamps: true}
)

module.exports = mongoose.model("Message", MessageSchema)