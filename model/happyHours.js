const mongoCollections = require('../config/mongoCollection'),
    passwordHash = require('password-hash'),
    bars = mongoCollections.happyHours,
    barSpecials = mongoCollections.barSpecials,
    barSpecialReviews = mongoCollections.barSpecialReviews;

exports.createBar = async (name, address, longitude, latitude, yelpURL, openingHours, closingHours, description) => {
    if (!name || !address || !longitude || !latitude || !yelpURL || !openingHours || !closingHours || !description) {
        throw 'You must have a name, address, longitude, latitude, yelpURL, openingHours, closingHours, and a description when creating a bar.' 
    }

    const barsCollection = await bars();
    const bar = await barsCollection.findOne({ name: name });

    if (bar) {
        throw 'That bar already exists.';
    }

    const newBar = {
        name: name,
        address: address, 
        longitude: longitude,
        latitude: latitude,
        yelpURL: yelpURL, 
        openingHours: openingHours, 
        closingHours: closingHours,
        description: description,
    }
    
    const response = await barsCollection.insertOne(newBar);
    return response;
}

exports.barExists = async (name) => {

    if (!name) {
        throw 'You must enter a name';
    }
    const barsCollection = await bars();
    const bar = await barsCollection.findOne({ name: name });
    const response = {
        bar: bar,
        exists: bar != null,
    }
    return response;
}

exports.addBarSpecial = async (bar, name, startEndTimes, description, daysOfWeek) => {

    if (!bar || !name || !startEndTimes || !description || !daysOfWeek) {
        throw 'You must enter a bar, name, startEndTimes, description, and daysOfWeek';
    }

    const barSpecialsCollection = await barSpecials();
    const barSpecial = await barSpecialsCollection.findOne({ name: name});
    if (barSpecial) {
        throw 'That bar special already exists.';
    }

    const newBarSpecial = {
        bar: bar._id,
        name: name,
        description: description,
        startEndTimes: startEndTimes,
        daysOfWeek: daysOfWeek,
    };

    const response = await barSpecialsCollection.insertOne(newBarSpecial);
    return response;
}

exports.addBarSpecialReview = async (user, barSpecial, score, explanation) => {

    if (!user || !barSpecial || !score || !explanation) {
        throw 'You must enter a user, barSpecial, score, and explanation';
    }

    const barSpecialReviewsCollection = await barSpecialReviews();
    const newBarSpecialReview = {
        user: user._id,
        barSpecial: barSpecial._id,
        score: score,
        explanation: explanation,
    };

    const response = await barSpecialReviewsCollection.insertOne(newBarSpecialReview);
    return response;
}