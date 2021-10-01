let mongoose = require('mongoose')

let tweetSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    }, 
    content: {
        type: String, 
        required: true
    }, 
    dateTweeted: {
        type: Date, 
        default: Date.now
    }
})

module.exports = mongoose.model('Tweet', tweetSchema)