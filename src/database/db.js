let options = {
    client: 'pg',
    connection: 'postgres://kqbskseeiqjfmg:18d840694a5f2bd0844fe8e044bce203f352f7e0adadb9451c6d49bcbed477ed@ec2-18-206-20-102.compute-1.amazonaws.com:5432/db42ua99bg3803',
    pool: {
      min: 2,
      max: 10
    },
}

var db = require('knex')(options);

// var knex = require('knex')({
//     client: 'mysql',
//     connection: {
//       user : 'sql10406099',
//       password : 'tcew7ib2xi',
//       database : 'sql10406099'
//     }
// });

module.exports = db