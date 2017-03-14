var express = require('express');
var router = express.Router();
var models = require('../models');
var Promise = require('bluebird');
var Page = models.Page;
var User = models.User;
module.exports = router;

// GET /users
router.get('/', function (req, res, next) {

    User.findAll({})
        .then(function (users) {
            res.render('userlist', {users: users});
        })
        .catch(next);

});

// GET /users/(dynamicvalue)
router.get('/:userId', function (req, res, next) {

    var findUser = User.findById(req.params.userId);//sequelize method: .findById

    var findPages = Page.findAll({
        where: {
            authorId: req.params.userId
        }
    });

//NB   Reacting to the sync stuff going on above!!!
//resolves to two things: users and pages
    Promise.all([findUser, findPages])
        .spread(function (user, userPages) {
            res.render('userpages', {
                pages: userPages,
                user: user
            });
        })
        .catch(next);

});
