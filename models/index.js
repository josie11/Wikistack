var Sequelize = require('sequelize');
var db = new Sequelize('postgres://localhost:5432/wikistack', {
    logging: false
});

var Page = db.define( 'page', {
  title: {type: Sequelize.STRING, allowNull: false},
  urltitle: {type: Sequelize.STRING, allowNull: false},
  content: {type: Sequelize.TEXT, allowNull: false},
  status: {type: Sequelize.ENUM('open', 'closed')},
  tags: {type: Sequelize.ARRAY(Sequelize.TEXT)},
  // date: {type: Sequelize.DATE,
  //   defaultValue: Sequelize.NOW},
  route: {type: Sequelize.VIRTUAL,
    get: function(){
      return '/wiki/' + this.getDataValue('urltitle');
    }}
 });

Page.hook('beforeValidate', function(page){
  page.urltitle = generateUrlTitle(page.title);
})


var User = db.define('user', {
  name: {type:Sequelize.STRING, allowNull: false},
  email: {type: Sequelize.STRING, isEmail: true, allowNull: false}
});

function generateUrlTitle (title) {
  if (title) {
    // Removes all non-alphanumeric characters from title
    // And make whitespace underscore
    return title.replace(/\s+/g, '_').replace(/\W/g, '');
  } else {
    // Generates random 5 letter string
    return Math.random().toString(36).substring(2, 7);
  }
}

Page.belongsTo(User, {as: 'author'});

module.exports = {
  Page: Page,
  User: User,
};

