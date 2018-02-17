const axios = require('axios');
const iconv = require('iconv-lite');

const instance = axios.create({
  baseURL: 'http://www.meetingpointmco.nl/Roosters-AL/doc/',
  timeout: 5000,
  responseType: 'arraybuffer',
  transformResponse: [responseBody => iconv.decode(responseBody, 'iso-8859-1')],
});

module.exports = instance;
