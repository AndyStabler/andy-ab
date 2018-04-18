const path = require('path');

module.exports = {
  mode: 'production',
  entry: './lib/andy-ab.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'andy-ab.js',
    libraryTarget: 'var',
    library: 'AndyAB',
  },
};
