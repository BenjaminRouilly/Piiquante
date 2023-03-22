const Sauce = require('../models/Sauce');
const fs = require('fs');


/* Création d'une nouvelle sauce */
exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    console.log(sauceObject);
    delete sauceObject._id;
    delete sauceObject._userId;
    console.log("req.auth", req.auth);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' }) })
        .catch(error => { res.status(400).json({ error }) })
};

/* Modification d'une sauce existante */
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._id;
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const IsImageUrl = sauceObject.imageUrl;
                // Si changement d'image, cherche l'image de l'article et la supprime du dossier /images
                // Si IsImageUrl est inexistant, alors juste modification du texte, on continue.
                if (IsImageUrl != undefined) {
                    Sauce.findOne({ _id: req.params.id }).then((sauce) => {
                        /* On stocke l'ancienne image qu'on a identifiée avec le split qui va chercher après le 4eme / de l'adresse
                        dans une variable oldImage, et on la supprime avec unlink  */
                        const oldImage = sauce.imageUrl.split('/')[4];
                        fs.unlink(`images/${oldImage}`, () => { });
                    });
                }
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet modifié!' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
}

/* Suppréssion d'une sauce */
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauce.deleteOne({ _id: req.params.id })
                        .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        });
};

/* Affichage d'une sauce selectionnée */
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => res.status(200).json(sauce))
        .catch((error) => (404).json({ error }));
};

/* Affichage de toutes les sauces */
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then((sauces) => res.status(200).json(sauces))
        .catch((error) => (400).json({ error }));
};

/* Ajout/suppression d'un like/dislike */
exports.likeDislike = (req, res) => {
    // Récuperer la sauce
    Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            // Like si l'utilisateur n'a pas déjà liké/disliké la sauce
            if (
                !sauce.usersLiked.includes(req.body.userId) &&
                !sauce.usersDisliked.includes(req.body.userId) &&
                req.body.like === 1
            ) {
                // Ajout 1 like + id utilisateur dans usersLiked
                Sauce.updateOne(
                    { _id: req.params.id },
                    { $inc: { likes: 1 }, $push: { usersLiked: req.body.userId } }
                )
                    .then(() => res.status(201).json({ message: 'Like enregistré' }))
                    .catch((error) => res.status(400).json({ error }));

                // Dislike si l'utilisateur n'a pas déjà liké/disliké la sauce
            } else if (
                !sauce.usersLiked.includes(req.body.userId) &&
                !sauce.usersDisliked.includes(req.body.userId) &&
                req.body.like === -1
            ) {
                // Ajoute 1 dislike + id utilisateur dans usersDisliked
                Sauce.updateOne(
                    { _id: req.params.id },
                    { $inc: { dislikes: 1 }, $push: { usersDisliked: req.body.userId } }
                )
                    .then(() => res.status(201).json({ message: 'Dislike enregistré' }))
                    .catch((error) => res.status(400).json({ error }));
                // Si l'utilisateur retire son like
            } else if (
                sauce.usersLiked.includes(req.body.userId) &&
                req.body.like === 0
            ) {
                // Enlève 1 like + Retire id utilisateur dans usersLiked
                Sauce.updateOne(
                    { _id: req.params.id },
                    { $inc: { likes: -1 }, $pull: { usersLiked: req.body.userId } }
                )
                    .then(() => res.status(200).json({ message: 'Like annulé' }))
                    .catch((error) => res.status(400).json({ error }));
                // Si l'utilisateur retire son dislike
            } else if (
                sauce.usersDisliked.includes(req.body.userId) &&
                req.body.like === 0
            ) {
                // Enlève 1 dislike + Retire id utilisateur dans usersDisliked
                Sauce.updateOne(
                    { _id: req.params.id },
                    { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.body.userId } }
                )
                    .then(() => res.status(200).json({ message: 'Dislike annulé' }))
                    .catch((error) => res.status(400).json({ error }));
            }
        })
        .catch((error) => res.status(404).json({ message: 'Non authorisé' }));
};