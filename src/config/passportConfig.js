require('dotenv').config();
const passport = require('passport');
const OpenIDConnectStrategy = require('passport-openidconnect');
const FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new OpenIDConnectStrategy({
    issuer: 'https://accounts.google.com',
    authorizationURL: 'https://accounts.google.com/o/oauth2/auth',
    tokenURL: 'https://oauth2.googleapis.com/token',
    userInfoURL: 'https://openidconnect.googleapis.com/v1/userinfo',
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET_CODE,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['openid', 'profile', 'email']
}, (issuer,profile,done) => {
    return done(null, profile);
}));

passport.use(new FacebookStrategy({
    clientID: 'TON_APP_ID_FACEBOOK',
    clientSecret: 'TON_APP_SECRET_FACEBOOK',
    callbackURL: 'http://localhost:3004/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'email']
}, (accessToken, refreshToken, profile, done) => {
    // Ici tu peux gérer l'utilisateur (sauvegarder, chercher en BDD, etc.)
    return done(null, profile);
}));

// Sérialisation / Désérialisation de l’utilisateur
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});
