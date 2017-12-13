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

app.get('/:barID', (req, res) => {
    const barID = req.params.barID;
    happyHours.fetchBar(barID).then(bar => {
        return res.render('bar', {
            bar: bar,
        })
    }).catch(err => {
        console.log(err);
    });
});

app.get('/:barID/:specialID', (req,res) => {
    const barID = req.params.barID;
    const specialID = req.params.specialID;

    happyHours.fetchBarSpecial(specialID).then( barSpecial => {
        return res.render('bar-special', {
            barSpecial: barSpecial,
        });
    }).catch( err => {
        console.log(err);
    });
});

app.post('/bar', (req, res) => {
    
});

app.post('/:barID/special', (req, res) => {
    const barID = req.params.barID;

});

app.post('/:barID/:specialID/review', (req, res) => {
    const barID = req.params.barID;
    const specialID = req.params.specialID;


});



app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});