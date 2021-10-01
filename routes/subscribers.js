let express = require('express')
let router = express.Router()
let Subscriber = require('../models/subscriber')


async function getMostPopularSubscriber(res){
    let subscribers = await Subscriber.find()
   
    //validate there are subscribers
    if (subscribers.length === 0 ){
        return res.status(500).json({message: 'there are no subscribers'})
    }
  
    //find the most popular subscriber by sub.numOfFollowers
    popularSubNumOfFollowers = -1
    for (let sub of subscribers){
        currNumOfFollowers = sub.numOfFollowers
        if (currNumOfFollowers > popularSubNumOfFollowers){
            popularSubNumOfFollowers = currNumOfFollowers
            popularSubUsername = sub.username
        }
    }
    return res.send('The most popular subscriber is: ' + popularSubUsername)
}

// get a specific subscriber's details/ the most popular subscriber
router.get('/', async (req, res) => {
    if (req.body.action === 'getMostPopularSubscriber'){
        return await getMostPopularSubscriber(res)
    }
    
    //get a subscriber 
    if (req.body.action === 'getSubscriber'){
        let password = req.body.password
        let username = req.body.username
        if (!await validateSubscriber(res, username, password)){
            return res.status(500).send('incorrect username or password')
        }
        return res.status(200).json(await getSubscriberByUsername(username))
    }
})

//create subscriber 
router.post('/', async (req, res) => {
    let subscriber = new Subscriber({
        username: req.body.username, 
        password: req.body.password
    })
    try{
        let newSubscriber = await (subscriber.save())
        res.status(200).json(newSubscriber)
    }
    catch (err){
        res.status(500).json({message: err.message })
    }
})

//change password  
async function changePassword(res, subscriber, newPassword){
    try {
        subscriber.password = newPassword
        let updatedSubscriber = await subscriber.save()
        return res.status(200).json(updatedSubscriber)
    }
    catch (err){
        return res.status(500).send(err.message)
    }
}

//follow 
async function follow(res, subscriber, usernameToFollow){
    try{
        let subToFollow = await getSubscriberByUsername(usernameToFollow)
        
        //validating usernameToFollow exists
        if (!subToFollow){
            return res.status(500).send('incorrect usernameToFollow')
        }
        
        //validating a subscriber won't follow itself
        if (usernameToFollow === subscriber.username){
            return res.status(500).send('You cant follow yourself')
        }
        
        // validating the subscriber isn't already following  
        if (isFollowExists(res, subscriber, usernameToFollow)){
            return res.status(500).send('already following')
        }
        
        //updating both follower and followed 
        subToFollow.numOfFollowers = subToFollow.numOfFollowers + 1
        subscriber.follow.push(usernameToFollow)
        await subToFollow.save()
        await subscriber.save()
        return res.status(200).send('follow sucessed')
    }
    catch(err){
        return res.status(500).send(err.message)
    }
}

// unfollow
async function unfollow(res, subscriber, usernameToUnfollow){
    try{
        let subToUnfollow = await getSubscriberByUsername(usernameToUnfollow)
        
        //validating usernameToUnfollow exists
        if (!subToUnfollow){
            return res.status(500).send('incorrect usernameToUnfollow')
        }
        
        //validating a subscriber won't unfollow itself
        if (usernameToUnfollow === subscriber.username){
            return res.status(500).send('You cant unfollow yourself')
        }
        
        // validating the subscriber is following  
        if (!isFollowExists(res, subscriber, usernameToUnfollow)){
            return res.status(500).send(subscriber.username + ' is not following ' + usernameToUnfollow)
        }
        
        //updating both follower and unfollowed 
        subToUnfollow.numOfFollowers = subToUnfollow.numOfFollowers - 1
        indexOfUsernameToUnfollow = subscriber.follow.indexOf(usernameToUnfollow)
        subscriber.follow.splice(indexOfUsernameToUnfollow)
        await subToUnfollow.save()
        await subscriber.save()
        return res.status(200).send('unfollow sucessed')
    }
    catch(err){
        return res.status(500).send(err.message)
    }
}


// actions- change password/ follow/ unfollow
router.patch('/', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let action = req.body.action;
    let subscriber = await getSubscriberByUsername(username)
    
    // validating subscriber exists
    if (! await validateSubscriber(res, username, password)){
        return res.status(500).send('incorrect username or password')
    }
    
    // action change password
    if (action === 'changePassword'){
        let newPassword = req.body.newPassword;
        return await changePassword(res, subscriber, newPassword)
    }
    
    // action follow
    if (action === 'follow'){
        let usernameToFollow = req.body.usernameToFollow
        return await follow(res, subscriber, usernameToFollow)
    }
    
    // action unfollow
    if (action === 'unfollow'){
        let usernameToUnfollow = req.body.usernameToUnfollow
        return await unfollow(res, subscriber, usernameToUnfollow)
    }
})

// get subscriber by username 
async function getSubscriberByUsername(username){
    let subscriber = await Subscriber.find().where({username: username});
    return subscriber[0]
}

// validate username and password are correct 
async function validateSubscriber(res, username, password){
    let subscriber = await getSubscriberByUsername(username)
    try{
        if (!subscriber || password !== subscriber.password){
            return false
        }
    }
    catch (err){
        return res.status(500).send(err.message)
    }
    return true
}

// checking if follower is following followed 
function isFollowExists(res, follower, followedUsername){
    if (follower.follow.indexOf(followedUsername) !== -1){
        return true
    }
    return false
}

module.exports = {router, validateSubscriber, getSubscriberByUsername}