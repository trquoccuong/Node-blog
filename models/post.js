'use strict';

module.exports = function(sequelize, DataTypes) {
    var Post =  sequelize.define("Post", {
        id : {
            type : DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement : true
        },
        title:  {
            type : DataTypes.STRING,
            allowNULL : false
        },
        content : {
            type: DataTypes.TEXT,
            allowNULL : false
        },
        description: {
            type: DataTypes.STRING
        },
        author : {
            type: DataTypes.INTEGER
        },
        type :{
            type: DataTypes.STRING
        }
    },{
        updatedAt: 'updated',
        createdAt: 'created',
        freezeTableName : true
    })
    Post.sync();
    return Post
}