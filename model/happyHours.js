const mongoCollections = require('../config/mongoCollection'),
    passwordHash = require('password-hash'),
    bars = mongoCollections.bars,
    barSpecials = mongoCollections.barSpecials,
    barSpecialReviews = mongoCollections.barSpecialReviews,
    ObjectId = require('mongodb').ObjectId;

exports.createBar = async (name, address, /* longitude, latitude, yelpURL, openingHours, closingHours*/ description) => {
    
    if (!name || !address /*|| !longitude || !latitude || !yelpURL || !openingHours || !closingHours*/ || !description) {
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
        /*longitude: longitude,
        latitude: latitude,
        yelpURL: yelpURL, 
        openingHours: openingHours, 
        closingHours: closingHours,*/
        description: description,
    }
    
    const response = await barsCollection.insertOne(newBar);
    return response;
}

exports.fetchBar = async (barID) => {
    if (!barID) {
        throw 'You must enter a barID';
    }

    const barsCollection = await bars();
    const bar = await barsCollection.findOne({ _id: ObjectId(barID) });

    return bar;
}

exports.fetchBarAndSpecials = async (barID) => {
    if (!barID) {
        throw 'You must enter a barID';
    }

    const bar = await exports.fetchBar(barID);
    const barSpecials = await exports.fetchBarSpecials(barID);

    const response = {
        bar: bar,
        barSpecials: barSpecials,
    };
    return response;
}

exports.fetchBars = async (a) => {
    console.log("here");
    const barsCollection = await bars();
   
    const theBars = await barsCollection.find({}).toArray();

    return theBars;
};

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

exports.addBarSpecial = async (barID, name, when, description) => {

    if (!barID || !name || !when || !description) {
        throw 'You must enter a bar, name, when, description';
    }

    const barSpecialsCollection = await barSpecials();
    const barSpecial = await barSpecialsCollection.findOne({ name: name});
    if (barSpecial) {
        throw 'That bar special already exists.';
    }

    const newBarSpecial = {
        bar: barID,
        name: name,
        when: when,
        description: description,
    };

    const response = await barSpecialsCollection.insertOne(newBarSpecial);
    return response;
}


exports.fetchBarSpecialAndReviews = async (barID, barSpecialID) => {

    if (!barID) {
        throw 'You must enter a barID';
    }

    const barSpecial = await exports.fetchBarSpecial(barSpecialID);
    const barSpecialReviews = await exports.fetchBarSpecialReviews(barSpecialID);

    const response = {
        barSpecial: barSpecial,
        barSpecialReviews: barSpecialReviews,
    }
    
    return response;
}

exports.fetchBarSpecials = async (barID) => {
    if (!barID) {
        throw 'You must enter a barID';
    }

    const barSpecialsCollection = await barSpecials();
    const theBarSpecials = await barSpecialsCollection.find({ bar: barID}).toArray();
    
    return theBarSpecials;
}

exports.fetchBarSpecial = async (barSpecialID) => {

    if (!barSpecialID) {
        throw 'You must enter a specialID';
    }

    const barSpecialsCollection = await barSpecials();
    const barSpecial = await barSpecialsCollection.findOne({ _id: ObjectId(barSpecialID)});
    
    return barSpecial;
}

exports.addBarSpecialReview = async (barSpecialID, author, score, explanation) => {

    if (!barSpecialID || !author || !score || !explanation) {
        throw 'You must enter a barSpecialID, author, score, and explanation';
    }

    const barSpecialReviewsCollection = await barSpecialReviews();
    const newBarSpecialReview = {
        barSpecialID: barSpecialID,
        author: author,
        score: score,
        explanation: explanation,
    };

    const response = await barSpecialReviewsCollection.insertOne(newBarSpecialReview);
    return response;
}

exports.fetchBarSpecialReviews = async (barSpecialID) => {
    
    if (!barSpecialID) {
        throw 'You must enter a barSpecialID';
    }

    const barSpecialReviewsCollection = await barSpecialReviews();
    const theBarSpecialReviews = await barSpecialReviewsCollection.find({ barSpecialID: barSpecialID }).toArray();
    
    return theBarSpecialReviews;   
}