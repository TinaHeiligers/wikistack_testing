var Sequelize = require('sequelize');
var marked = require('marked');

var db = new Sequelize('postgres://localhost:5432/wikistack', {
    logging: false
});

var Page = db.define('page', {
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    urlTitle: {
        type: Sequelize.STRING,
        allowNull: false,
        //since we are searching, editing, deleting by urlTitle, these need to be unique
        unique: true
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    status: {
        type: Sequelize.ENUM('open', 'closed')
    },
    tags: {
        type: Sequelize.ARRAY(Sequelize.STRING),//.ARRAY only works when using postgress
        defaultValue: [],
        set: function (tags) {
//takes the value of page.tags as they are being captured from the form
//splits them if they are a string and not an array,
//returns an array from the string that's been comma seperated that's trimmed
            tags = tags || [];

            if (typeof tags === 'string') {
                tags = tags.split(',').map(function (str) {
                    return str.trim();
                });
            }

            this.setDataValue('tags', tags);//Absolutly essential to circumvent any setter just for the assignment once. This won't happen again after it's been set.

        }
    }
}, {
    getterMethods: {//these don't need to be called, they can simply be accessed
        route: function () {
            return '/wiki/' + this.urlTitle;
        },
        renderedContent: function () {
            return marked(this.content);
        }
    },
    classMethods: {//min 41 in video2
        findByTag: function (tag) {
            return this.findAll({
                where: {
                    tags: {
                        $contains: [tag]//only works with postgress, see the docs for sequelize
                    }
                }
            });
        }
    },
    instanceMethods: {
        findSimilar: function () {
            return Page.findAll({
                where: {
                    id: {
                        $ne: this.id
                    },
                    tags: {
                        $overlap: this.tags
                    }
                }
            });
        }
    }
});

Page.hook('beforeValidate', function (page) {
    if (page.title) {
        //'parsing' the given title as a url friendly title
        page.urlTitle = page.title.replace(/\s/g, '_').replace(/\W/g, '');
    } else {
        page.urlTitle = Math.random().toString(36).substring(2, 7);
    }
});

var User = db.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    }
});

//NB CODE TO LINK TWO TABLES TOGETHER!!!!
//This adds methods to 'Page', such as '.setAuthor'. It also creates a foreign key attribute on the Page table pointing ot the User table
Page.belongsTo(User, {
    as: 'author'
});

module.exports = {
    Page: Page,
    User: User
};
