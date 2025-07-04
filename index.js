require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const router = require('./src/routes/index');

require('./src/config/passportConfig');

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(router);

/*p.get('/', (req, res) => {
    res.send('Serveur Express opérationnel !');
});*/
app.get('/', (req, res) => {
    res.send('<h1>Bienvenue sur l\'application</h1> <a href="/auth">Se connecter avec Google</a>');
});



const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
