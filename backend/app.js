const express = require('express');

const mongoose = require('mongoose');

const dotenv = require("dotenv").config({ encoding: "latin1" });

const Thing = require('./models/thing');

mongoose.connect(process.env.DBCONNECT,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

// Pour gérer la requête POST venant de l'app front, on doit en extraire le corps JSON. Ce middleware du framework Express le permet
app.use(express.json()); // Express va prendre les requêtes ayant un Content-Type application/json et mettre à disposition leur body directement sur l'objet req

app.use((req, res, next) => {  // Middleware général, sera appliqué à toutes les routes et requêtes envoyées à notre serveur
    res.setHeader('Access-Control-Allow-Origin', '*'); // Tout le monde à le droit d'accéder à notre API
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // On autorise certains headers aux requêtes envoyées vers l'API
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // On autorise certaines méthodes pour l'envoi des requêtes vers l'API
    next();
});

app.post('/api/stuff', (req, res, next) => {
    delete req.body._id; // On enlève l'ID car il n'y a pas besoin de l'ajouter à notre nouvelle instance vu qu'il est généré automatiquement par la DB
    const thing = new Thing({
        ...req.body
        /* L'opérateur spread "..." est utilisé pour faire une copie de tous les éléments de req.body. 
        Exemple pour le "title" cela évite d'écrire title: req.body.title et ainsi de suite pour les autres champs */
    });
    thing.save()
        .then(() => res.status(201).json({ message: 'Objet enregistré !' }))
        .catch(error => res.status(400).json({ error }));
});

app.put('/api/stuff/:id', (req, res, next) => {
    Thing.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
});

app.delete('/api/stuff/:id', (req, res, next) => {
    Thing.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet supprimé !' }))
        .catch(error => res.status(400).json({ error }));
});

app.get('/api/stuff/:id', (req, res, next) => {  // On recherche le "Thing" ayant le même ID que le paramètre de la requête
    Thing.findOne({ _id: req.params.id })
        .then(thing => res.status(200).json(thing)) // Ce "Thing" est ensuite retourné dans une Promise et envoyé au frontend
        .catch(error => res.status(404).json({ error })); // Si aucun "Thing" n'est trouvé ou si une erreur se produit, une erreur 404 sera envoyée au front
});

app.get('/api/stuff', (req, res, next) => {  // http://localhost:3000/api/stuff  L'URL visée par l'application = route = endpoint. Le front va récupérer les infos sur cette URL.
    Thing.find()
        .then(things => res.status(200).json(things))
        .catch(error => res.status(400).json({ error }));
});

module.exports = app;