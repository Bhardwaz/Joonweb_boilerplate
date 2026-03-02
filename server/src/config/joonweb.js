const { Context } = require('@joonweb/joonweb-sdk');
require('dotenv').config();
const { env } = require("../config/env");

Context.init({
  api_key: process.env.JOONWEB_CLIENT_ID,
  api_secret: process.env.JOONWEB_CLIENT_SECRET,
  api_version: process.env.JOONWEB_API_VERSION || '26.0',
  is_embedded: true,
  session_storage_type: 'mongodb',
  session_storage_options: {
    url: process.env.MONGODB_URI,
    dbName: env.db_name
  }
});

const sessionManager = Context.getSessionStorage();

module.exports = { sessionManager };