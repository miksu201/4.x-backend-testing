const morgan = require('morgan')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

morgan.token('body', function (req) { return JSON.stringify(req.body) })

// helper for creating user blog
const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
      request.token = authorization.replace('Bearer ', '')
      return next()
    }
    return next()
  }

const userExtractor =  async (request, response, next) => {
    if(request.token == undefined) { return response.status(401).json({ error: 'no token' })}
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    request.user = await User.findById(decodedToken.id)
    return next()

  }

module.exports = {
    morgan,tokenExtractor, userExtractor
}