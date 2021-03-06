const express = require('express'),
    bodyParser = require('body-parser'),
    expressHandlebars = require('express-handlebars'),
    handlebars = require('handlebars'),
    routes = require('./routes'),
    authentication = require('./model/authentication'),
    session = require('express-session'),
    happyHours = require('./model/happyHours');

const expressHandlebarsEngine = expressHandlebars.create({ defaultLayout: 'main'}).engine;

const app = express();

app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('handlebars', expressHandlebarsEngine);
app.set('view engine', 'handlebars');

app.use(session({
    secret: "alksjd980d91j0podk-10dkkosad",
    resave: false,
    saveUninitialized: true,
    cook: { secure: true }
}));

app.use(function(req, res, next) {
	// if there's a flash message, transfer
	// it to the context, then clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

app.get('/', (req, res) => {
    console.log(req.session.user);
    res.render('home', {
        user: req.session.user,
    });
});

app.get('/profile', (req, res) => {
    res.render('profile', {
        user: req.session.user,
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    authentication.credentialsCorrect(email, password).then( response => {
        const correct = response.isCorrect;
        const user = response.user;
        if (correct) {
            req.session.user = user;
        } else {
            console.log("not correct");
            req.session.flash = {
                type: 'danger',
                intro: 'Error!',
                message: 'Invalid email or password.',
            }  
        }
        req.session.save(() => {
            if (correct) {
                return res.redirect(303, '/');
            } else {
                return res.redirect(303, '/login');
            }
        })
    }).catch( err => {
        console.log(err);
    });

});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    const email = req.body.email;
    const displayName = req.body.displayName;
    const password = req.body.password;
    console.log(`New User Signup - email: ${email}  displayName: ${displayName}  pw: ${password}`);
    authentication.signupUser(email, displayName, password).then( user => {
        if (!user) {
            req.session.flash = {
                type: 'danger',
                intro: 'Error!',
                message: 'Something went wrong.',
            }
            req.session.save(() => {
                return res.redirect(303, '/signup');
            });
        }

        req.session.user = user;
        req.session.save(() => {
            return res.redirect(303, '/');
        });
    
    }).catch( err => {
        console.error(err);
        req.session.flash = {
            type: 'danger',
            intro: 'Error!',
            message: 'That email is already registered with a different user.',
        }
        req.session.save(() => {
            return res.redirect(303, '/signup');
        })
    })
});

app.get('/create-bar', (req, res) => {
    return res.render('create-bar');
});

app.get('/bars', (req, res) => {
    
    happyHours.fetchBars().then( bars => {

        return res.render('bars', {
            bars: bars,
        });
    }).catch( err => {
        console.log(err);
    });
});
    
app.get('/bars/:barID/specials/:barSpecialID', (req,res) => {

    const barID = req.params.barID;
    const barSpecialID = req.params.barSpecialID;

    happyHours.fetchBarSpecialAndReviews(barID, barSpecialID).then( response => {
        const barSpecial = response.barSpecial;
        const barSpecialReviews = response.barSpecialReviews;
        return res.render('bar-special', {
            barSpecial: barSpecial,
            barSpecialReviews: barSpecialReviews,
            user: req.session.user,
        });

    }).catch(err => {
        console.log(err);
    });
});

app.post('/bars/:barID/specials/:barSpecialID/add-review', (req, res) => {
    const barID = req.params.barID;
    const barSpecialID = req.params.barSpecialID;

    const author = req.body.author;
    const score = req.body.score;
    const explanation = req.body.explanation;

    happyHours.addBarSpecialReview(barSpecialID, author, score, explanation).then(response => {

        return res.redirect(303, `/bars/${barID}/specials/${barSpecialID}`);
    }).catch(err => {
        console.log(err);
        req.session.flash = {
            type: 'danger',
            intro: 'Error!',
            message: 'Something went wrong.',
        };
        req.session.save(() => {
            return res.redirect(303, `/bars/${barID}/specials/${barSpecialID}/add-review`);
        });
    });

});


app.get('/bars/:barID', (req, res) => {
    const barID = req.params.barID;

    happyHours.fetchBarAndSpecials(barID).then( response => {

        return res.render('bar', {
            bar: response.bar,
            barSpecials: response.barSpecials,
        });

    }).catch(err => {
        console.log(err);
    });
});


app.post('/create-bar', (req, res) => {
    const name = req.body.name;
    const address = req.body.address;
    const description = req.body.description;

    happyHours.createBar(name, address, description).then( response => {
        
        return res.redirect(303, `/bars/${response.insertedId}`);

    }).catch( err => {
        console.log(err);
        req.session.flash = {
            type: 'danger',
            intro: 'Error!',
            message: 'That bar already exists.',
        };
        req.session.save(() => {
            return res.redirect(303, '/create-bar');
        });
    });
});

app.post('/bars/:barID/add-happy-hour', (req, res) => {

    const barID = req.params.barID;
    const name = req.body.name;
    const when = req.body.when;
    const description = req.body.description;

    happyHours.addBarSpecial(barID, name, when, description).then(resposne => {
        return res.redirect(303, `/bars/${barID}`);
    }).catch( err => {
        console.log(err);
        req.session.flash = {
            type: 'danger',
            intro: 'Error!',
            message: 'Something went wrong.',
        };
        req.session.save(() => {
            return res.redirect(303, '/create-bar');
        });
    })

});

app.post('/:barID/:specialID/review', (req, res) => {
    const barID = req.params.barID;
    const specialID = req.params.specialID;


});



app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});