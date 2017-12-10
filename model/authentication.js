const mongoCollections = require('./config/mongoCollection'),
    passwordHash = require('password-hash'),
    users = mongoCollections.users;

exports.signupUser = async (email, displayName, password) => {
    if (!email || !displayName || !password) {
        throw 'email, displayName, and password cannot be null.';
    }

    const user = await users.findOne({ email: email });
    if (user) {
        throw 'That user already exists.';
    }

    const newUser = {
        email: email,
        displayName: displayName,
        hashedPassword: passwordHash.generate(password),
    }

    const reponse = await users.insertOne(newUser);
    return response;
}

