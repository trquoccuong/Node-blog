var express = require('express');
var router = express.Router();
var chalk = require('chalk');
var config = require('../config.js');

/* GET users listing. */
router.route('/')
    .get(function (req, res, next) {
        db.user.findAll().then(function (result) {
            res.render('admin-index',{
                users: result
            });
        })
    });

router.route('/new')
    .get(function (req,res) {
        res.render('admin-user-create');
    })
    .post(function (req, res, next) {
        req.checkBody('username', 'Username field is required').notEmpty();
        req.checkBody('display_name', 'Display name field is required').notEmpty();
        req.checkBody('password', 'Password field is required').notEmpty();
        req.checkBody('confirm_password', 'Confirm Password field is required').notEmpty();
        req.checkBody('confirm_password', 'Passwords do not match').equals(req.body.password);


        var errors = req.validationErrors();

        if (errors) {
            return res.render('admin-user-create', {
                username: req.body.username || '',
                display_name: req.body.display_name || ''
            })
        }
        db.user.create({
            username: req.body.username,
            displayname: req.body.display_name,
            password: req.body.password
        }).then(function () {
            req.flash('success', 'User create successfully');
            res.redirect('/users/');
        }).catch(function (err) {
            return res.render('admin-user-create', {
                errors : err,
                username: req.body.username,
                display_name: req.body.display_name
            })
        })
    });



router.route('/posts')
    .get(function (req, res) {
        var page = req.query.page || 1;
        db.post.findAndCountAll({
            where: {
                type: "post"
            },
            order: ['created'],
            limit: config.pagination,
            offset: (page - 1) * config.pagination
        }).then(function (data) {
            var totalPage = Math.ceil(data.count / config.pagination);
            res.render('admin-post-list',
                {
                    posts: data.rows,
                    totalPage: totalPage,
                    currentPage: page
                }
            );
        })
    })


router.route('/posts/new')
    .get(function (req, res) {
        res.render('admin-post-index');
    })
    .post(function (req, res) {
        req.checkBody('title', 'Title field is required').notEmpty();
        req.checkBody('post-description', 'Description field is required').notEmpty();
        req.checkBody('post-content', 'Content field is required').notEmpty();

        var errors = req.validationErrors();

        if (errors) {
            return res.render('admin-post-index', {
                errors: errors,
                title: req.body.title || '',
                description: req.body['post-description'] || '',
                content: req.body['post-content'] || ''
            })
        }

        var newPost = {};
        newPost.title = req.body.title;
        newPost.description = req.body['post-description'];
        newPost.content = req.body['post-content'];
        newPost.type = 'post';
        newPost.author = req.user.id;
        db.post.create(newPost).then(function () {
            req.flash('success', 'Create post successfully');
            res.redirect('/users/posts')
        })
    });

router.route('/posts/:id')
    .get(function (req, res) {
        db.post.findById(req.params.id).then(function (post) {
            res.render('admin-post-index', {
                title: post.title,
                description: post.description,
                content: post.content,
                delete: true
            })
        })
    })
    .post(function (req, res) {
        var postId = req.params.id;
        req.checkBody('title', 'Title field is required').notEmpty();
        req.checkBody('post-description', 'Description field is required').notEmpty();
        req.checkBody('post-content', 'Content field is required').notEmpty();

        var errors = req.validationErrors();

        if (errors) {
            return res.render('admin-post-index', {
                errors: errors,
                title: req.body.title || '',
                description: req.body['post-description'] || '',
                content: req.body['post-content'] || '',
                delete: true
            })
        }

        db.post.findById(postId).then(function (post) {
            var newPost = {};
            newPost.title = req.body.title;
            newPost.description = req.body['post-description'];
            newPost.content = req.body['post-content'];
            newPost.type = 'post';
            post.update(newPost).then(function () {
                req.flash('success', 'Update post successfully');
                res.redirect('/users/posts')
            })
        });
    })
    .delete(function (req, res) {
        var postId = req.params.id || 0;
        db.post.destroy({
            where: {
                id: postId
            }
        }).then(function (result) {
            req.flash('success', 'Delete post successfully');
            res.redirect('/users/posts')
        })
    })

router.get('/logout', function (req,res) {
    req.logout();
    req.flash('success','You logged out');
    res.redirect('/users/login');
})

module.exports = router;
