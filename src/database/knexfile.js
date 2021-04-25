// Update with your config settings.

module.exports = {



  production: {
    client: 'postgresql',
    connection: '',
    pool: {
      min: 2,
      max: 10
    },
  }

};
