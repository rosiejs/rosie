const path = require('path')

module.exports = {
  color: true,
  recursive: true,
  reporter: 'spec',
  require: path.join(__dirname, '/hooks'),
  spec: [path.join(__dirname, '/specs'), path.join(__dirname, '/e2e')],
  extension: ['spec.js'],
  timeout: '2000',
  ui: 'bdd'
}
