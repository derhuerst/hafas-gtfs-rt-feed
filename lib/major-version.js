'use strict'

const pkg = require('../package.json')

// note: This does not handle all SemVer- & npm-valid version specifiers.
// It's decent enough for now though.
const MAJOR_VERSION = pkg.version.split('.')[0]

module.exports = MAJOR_VERSION
