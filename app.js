/*  package dotenv pour charger des variables d'environement senssibles comme les MDP dans .env 
    package rate-limit pour éviter les attaques de type bruteforce ou limiter le nombre de requêtes*/
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const rateLimit = require('express-rate-limit')
const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // temps en millisecondes d'application de la limite, ici 15 minutes
    max: 100, // nombre de requêtes autorisées dans l'intervalle de la limite, donc 100 en 15 minutes
    message: "Trop de tentatives de connexion. Compte bloqué pour 5 minutes",
    standardHeaders: true, // indique si les en-têtes standard doivent être inclus dans la réponse
    legacyHeaders: false, // indique si les en-têtes obsolètes doivent être inclus dans la réponse
})

app.use(cors());
app.use(express.json());

/* Middleware pour ajouter des en-têtes CORS pour autoriser l'accès à l'API depuis n'importe quelle origine */
app.use((req, res, next) => {
    /* Permet à toutes les requêtes d'origine de faire des appels à l'API */
    res.setHeader('Access-Control-Allow-Origin', '*');
    /*Définit l'en-tête "Access-Control-Allow-Headers" pour permettre à toutes les en-têtes 
    listées (Origin, X-Requested-With, Content, Accept, Content-Type, Authorization) d'être incluses dans les requêtes*/
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    /* Définit l'en-tête "Access-Control-Allow-Methods" pour permettre aux méthodes HTTP listées (GET, POST, PUT, DELETE, PATCH, OPTIONS)
     d'être utilisées dans les requêtes. */
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

const password = process.env.DB_PASSWORD;
const username = process.env.DB_USER;
/* Vérification de l'utilisateur et si ok connexion à la base de données non relationelle mongoDB */
mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.l4vp93r.mongodb.net/?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

/* Définition des routes de l'API et accès au fichier de stockage des images */
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;
