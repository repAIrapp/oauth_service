// const express = require('express');
// const passport = require('passport');
// const axios = require('axios');

// const router = express.Router();

// // Route pour démarrer l'authentification avec Google
// router.get('/', passport.authenticate('openidconnect'));
// // Route pour démarrer l'authentification avec facebook
// router.get('/facebook', passport.authenticate('facebook'));

// // Callback après l'authentification
// // router.get('/google/callback',
// //     passport.authenticate('openidconnect', { failureRedirect: '/' }),
// //     (req, res) => {
// //         res.redirect('/auth/profile'); // Redirige vers le profil après connexion
// //     }
// // );
// router.get('/google/callback',
//     passport.authenticate('openidconnect', { failureRedirect: '/' }),
//     async (req, res) => {
//         const profile = req.user;
//         const email = profile.emails?.[0]?.value;
//         const firstName = profile.name?.givenName;
//         const lastName = profile.name?.familyName;

//         try {
//             // Appel vers le DB service
//             const response = await axios.post('http://localhost:3001/api/users/oauth', {
//                 email,
//                 first_name: firstName,
//                 last_name: lastName,
//                 oauthProvider: 'google'
//             });

//             console.log('Utilisateur enregistré/obtenu via DB service:', response.data);

//             // Redirection vers profil ou front
//             res.redirect('/auth/profile');
//         } catch (error) {
//             console.error('Erreur lors de la création dans DB service:', error.message);
//             res.redirect('/');
//         }
//     }
// );


// // Callback après authentification Facebook
// router.get('/facebook/callback',
//     passport.authenticate('facebook', { failureRedirect: '/' }),
//     (req, res) => {
//         res.redirect('/auth/profile');
//     }
// );

// // Route du profil utilisateur (protégée)
// router.get('/profile', (req, res) => {
//     if (!req.isAuthenticated()) {
//         return res.redirect('/auth');
//     }
//     res.send(`<h1>Bienvenue ${req.user.displayName}</h1> <a href="/auth/logout">Déconnexion</a>`);
// });

// // Route pour la déconnexion
// router.get('/logout', (req, res) => {
//     req.logout(() => {
//         res.redirect('/');
//     });
// });

// module.exports = router;




const express = require('express');
const passport = require('passport');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'; // à sécuriser

//  Démarrer l'auth Google
router.get('/', passport.authenticate('openidconnect'));

//  Callback après Google login
router.get('/google/callback',
    passport.authenticate('openidconnect', { failureRedirect: '/' }),
    async (req, res) => {
        const profile = req.user;

        // ✅ Récupération des infos utilisateur Google
        const email = profile.emails?.[0]?.value;
        const firstName = profile.name?.givenName;
        const lastName = profile.name?.familyName;

        try {
            // ✅ Enregistrement (ou récupération) via le DB service
            const response = await axios.post('http://localhost:3001/api/users/oauth', {
                email,
                first_name: firstName,
                last_name: lastName,
                oauthProvider: 'google'
            });

            const user = response.data;

            // ✅ Générer un JWT
           const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          authType: 'oauth'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

           
         res.redirect(`http://localhost:3000/auth/callback?token=${token}`);

        } catch (error) {
            console.error('Erreur lors de l’appel au DB service:', error.message);
            res.redirect('/');
        }
    }
);

// 🔹 Auth Facebook (callback en attente d'intégration JWT)
router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/auth/profile');
    }
);

// 🔒 Route protégée (test)
router.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/auth');
    }
    res.send(`<h1>Bienvenue ${req.user.displayName || req.user.name?.givenName}</h1> <a href="/auth/logout">Déconnexion</a>`);
});

// 🔓 Déconnexion
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

module.exports = router;
