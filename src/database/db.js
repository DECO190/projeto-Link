var knex = require('knex')({
    client: 'mysql',
    connection: {
		host: '35.223.135.208',
     	user : 'root',
      	password : 'sempre190',
      	database : 'decode'
    }
});


module.exports = knex