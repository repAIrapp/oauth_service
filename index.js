require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const router = require('./src/routes/index');
const client = require("prom-client");

require('./src/config/passportConfig');

const app = express();
const register = new client.Registry();

const oauthRequestsCounter = new client.Counter({
  name: "oauth_requests_total",
  help: "Nombre total de requêtes sur le service OAuth",
  labelNames: ["method", "route", "status"]
});

register.registerMetric(oauthRequestsCounter);

client.collectDefaultMetrics({ register });

app.use((req, res, next) => {
  res.on("finish", () => {
    oauthRequestsCounter.inc({
      method: req.method,
      route: req.path,
      status: res.statusCode
    });
  });
  next();
});

app.use(session({
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: true
}));
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});

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
const metricsApp = express();
// metricsApp.use(express.json()); 
// metricsApp.use(require("cors")());
metricsApp.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.send(await register.metrics());
});
metricsApp.listen(9104, () => {
  console.log("oauth service metrics exposed on http://localhost:9104/metrics");
});