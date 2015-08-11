'use strict';
var bcrypt = require('bcrypt');
module.exports = function(sequelize, DataTypes) {
    var User =  sequelize.define("User", {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        username:  {
            type : DataTypes.STRING,
            allowNULL : false,
            unique: true
        },
        displayname: {
            type : DataTypes.STRING,
            allowNULL : false
        },
        password: {
            type: DataTypes.STRING,
            allowNULL: false
        }
    },{
        freezeTableName : true,
        hooks: {
            beforeCreate: function (user, op, fn) {
                bcrypt.hash(user.password,10, function (err, hash) {
                    if(err) throw  err;
                    user.password = hash;
                    fn(null, user);
                })
            }
        }
    })
    User.sync();
    return User
}