var express = require('express');
var router = express.Router();
var models = require('../models');
var Page = models.Page;
var User = models.User;
module.exports = router;

router.get('/', function(req, res,next) {
  Page.findAll().then(function(result) {
    console.log(result);
    res.render('index', {pages: result}) });
});

router.post('/', function(req,res,next) {
    // console.log(req.body);
        //returns array of object found or created, and whether it was found/created --> promise
    //.spread -->takes array result and splits array into parameters like splat
    var user = User.findOrCreate({where: {email: req.body.email, name: req.body.name}})
    .spread(function(obj, created){
      var page = Page.build({
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags.split(' '),
        status: req.body.status,
      });
      return page.save().then(function (page){
        return page.setAuthor(obj);
      })
      })
      .then(function(page){
        res.redirect(page.route);
      }).catch(next);

});

router.get('/users', function(req, res, next){
  User.findAll().then(function(result) {
    res.render('users', {users: result});
  })
})

router.get('/users/:user_id', function(req,res, next) {
  var userPromise = User.findById(req.params.user_id);
  var pagesPromise = Page.findAll({
    where: {
      authorId: req.params.user_id
    }
  });

  Promise.all([
    userPromise,
    pagesPromise
  ])
  .then(function(values) {
    var user = values[0];
    var pages = values[1];
    console.log(user,pages);
    res.render('userpage', { users: user, pages: pages });
  })
  .catch(next);

  });


router.get('/add', function(req,res,next) {
  res.render('addpage');
});

router.get('/:urltitle', function(req, res, next) {
  Page.findOne({
    where: {
    urltitle: req.params.urltitle
    },
    include: [
      {model: User, as: 'author'}
    ]
  })
  .then(function (page) {
    // page instance will have a .author property
    // as a filled in user object ({ name, email })
    console.log(page.author);
    if (page === null) {
        res.status(404).send();
    } else {
        res.render('wikipage', {
            page: page,
        });
    }
})
  .catch(next);
});



