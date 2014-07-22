module.exports = process.env.PRESERVATIVE_COV
  ? require('./lib-cov/preservative.js')
  : require('./lib/preservative.js');
