const express = require('express'),
    bodyParser = require('body-parser'),
    expressHandlebars = require('express-handlebars'),
    handlebars = require('handlebars'),
    routes = require('./routes');

const expressHandlebarsEngine = expressHandlebars.create({ defaultLayout: 'main'}).engine;

const app = express();

app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('handlebars', expressHandlebarsEngine);
app.set('view engine', 'handlebars');


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});