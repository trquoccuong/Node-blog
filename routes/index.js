var express = require('express');
var router = express.Router();
var config = require('../config');

/* GET home page. */
router.get('/', function (req, res, next) {
    var page = req.query.page || 1;
    db.post.findAndCountAll({
        include: {
            model: db.user,
            attribute: ['displayname']
        },
        where: {
            type: "post"
        },
        order: ['created'],
        limit: config.pagination,
        offset: (page - 1) * config.pagination
    }).then(function (data) {
        var totalPage = Math.ceil(data.count / config.pagination);
        res.render('index',
            {
                posts: data.rows,
                totalPage: totalPage,
                currentPage: page
            }
        );
    })
});

router.get('/posts/:id', function (req, res) {
    db.post.find({
        include:{ model: db.user,
            attribute: ['displayname']
        },
        id: req.params.id
    }).then(function (result) {
        if (result) {
            res.render('post',
                {
                    post: result
                }
            );
        } else {
            res.redirect('/');
        }
    }).catch(function (err) {
        res.render('error', {error: err})
    })
});

router.get('/about', function (req, res) {
    res.render('about')
});

module.exports = router;
