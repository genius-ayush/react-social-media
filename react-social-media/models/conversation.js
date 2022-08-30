const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new Schema({
    //list of people in the conversation, can scale this for group chats
    people:{
        type: Array,
    },
},
    {timestamps: true}
);

module.exports = mongoose.model("Conversations", ConversationSchema )