let mongoose = require('mongoose')

let subscriberSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    }, 
    password: {
        type: String, 
        minlength: 4,
        required: true
    }, 
    tweets: {
        type: Array, 
        default: []
    }, 
    follow: {
        type: Array,
        default: []
    }, 
    numOfFollowers: {
        type: Number, 
        default: 0
    }
})

module.exports = mongoose.model('Subscriber', subscriberSchema)