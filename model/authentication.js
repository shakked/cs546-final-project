const mongoCollections = require('../config/mongoCollection'),
    passwordHash = require('password-hash'),
    users = mongoCollections.users;

exports.signupUser = async (email, displayName, password) => {
    if (!email || !displayName || !password) {
        throw 'email, displayName, and password cannot be null.';
    }
    const usersCollection = await users();
    const user = await usersCollection.findOne({ email: email });
    if (user) {
        throw 'That user already exists.';
    }

    const newUser = {
        email: email,
        displayName: displayName,
        hashedPassword: passwordHash.generate(password),
    }

    const response = await usersCollection.insertOne(newUser);
    return response;
}

exports.credentialsCorrect = async (email, password) => {

    if (!email || !password) {
        throw 'email, and password cannot be null.';
    }

    const usersCollection = await users();
    const user = await usersCollection.findOne({ email: email });
    if (!user) { 
        return false;
     }
    const isPasswordCorrect = passwordHash.verify(password, user.hashedPassword);
    const response = {
        isCorrect: isPasswordCorrect,
        user: user,
    }
    return response;
}
