'use strict';
console.log('Config in development');
module.exports = {
  REQUESTS_DELAY: 0,
  REQUESTS_DELAY_SYSTEM: 0,
  baseURL: 'http://localhost:8111',
  db: process.env.MONGOHQ_URL || 'mongodb://' + (process.env.DB_PORT_27017_TCP_ADDR || 'localhost') + '/atwork',
  server: {
    host: 'localhost',
    port: 8111
  },
  secret: 'atworksecret',
  settings: {
  	perPage: 10,
  	email: {
  		service: 'Gmail'
  	}
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};