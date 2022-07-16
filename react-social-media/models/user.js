const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: String,
    email: {
        type: String,
        required: true,
    },
    hash: String,
    salt: String,
    profilePicture: {
        type: String,
        default: "",
      },
      coverPicture: {
        type: String,
        default: "",
      },
      followingCount: {
        type: Array,
        default: [],
      },
      followerCount: {
        type: Array,
        default: [],
      },
      admin: {
        type: Boolean,
        default: false,
      },
      desc: {
        type: String,
        max: 50,
      },
      city: {
        type: String,
        max: 50,
      },
      from: {
        type: String,
        max: 50,
      },
      relationship: {
        type: Number,
        enum: [1, 2, 3],
      },   
},
{ timestamps: true },

);


module.exports = mongoose.model('User', UserSchema);