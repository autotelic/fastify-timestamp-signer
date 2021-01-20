const crypto = require('crypto')

const generateRandomSalt = () => crypto.randomBytes(16).toString('hex')

const generateTimestamp = () => new Date().getTime()

module.exports = { generateRandomSalt, generateTimestamp }
