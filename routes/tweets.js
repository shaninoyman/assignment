let express = require('express')
let router = express.Router()
let Tweet = require('../models/tweet')
let subscribersRouter = require('./subscribers')

// Post a tweet
router.post('/', async (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let content = req.body.content
    
    // validating username and password
    subValid = await (subscribersRouter.validateSubscriber(res, username, password))
    if (!subValid){
        return res.status(400).send('incorrect username or password')
    }

    //uploading tweet
    let tweet = new Tweet({
        username: username, 
        content: content
    })
    try{
        let newTweet = await (tweet.save())
        let subscriber = await subscribersRouter.getSubscriberByUsername(username)
        
        //adding tweet to subscriber's tweets array
        await addTweetToSubscriber(res, subscriber, newTweet)    
        return res.status(201).json(newTweet)
    }
    catch (err){
        return res.send(err.message)
    }
})

// get home timline 
async function getHomeTimeline(res, subscriber){
    let allTweets = []
   
    //go over all of subscriber's follow
    for (let [key, username] of Object.entries(subscriber.follow)) {
        console.log(username)
        let currSub = await subscribersRouter.getSubscriberByUsername(username)
        console.log(typeof currSub.tweets)
        // add all followed tweets in order to sort and return them 
        for (let [key, tweet] of Object.entries(currSub.tweets)) {
            allTweets.push(tweet)
        }
    }
  
    // sort and return tweets
    allTweets = allTweets.sort(sortByDate)
    return res.status(200).json(allTweets)
}

//actions: home timeline/ subscriber timeline
router.get('/', async (req, res) => {
    let username = req.body.username
    let timelineType = req.body.timelineType
    let subscriber = await subscribersRouter.getSubscriberByUsername(username)
    try{
   
        //validating subscriber exists
        if(!subscriber){
            return res.status(400).send('incorrect username')
        }
        
        // user timeline
        if (timelineType === 'user'){
                let tweets = subscriber.tweets
                return res.json(tweets.sort(sortByDate))
        }
    
        //home timeline 
        if (timelineType === 'home'){
            return getHomeTimeline(res, subscriber)
        }
    }
    catch(err){
        return res.status(500).send(err.message)
    }
})

// tweets sort function 
function sortByDate(tweet1, tweet2) {
    return new Date(tweet2.dateTweeted).getTime() - new Date(tweet1.dateTweeted).getTime();
}

// add tweet to subscriber scheme 
async function addTweetToSubscriber(res, subscriber, newTweet){
    try{
        subscriber.tweets.push(newTweet)
        await subscriber.save()
    }
    catch (err){
        return res.status(400).json({message: err.message})
    }
}

module.exports = router