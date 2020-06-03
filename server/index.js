/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

const jsonServer = require('json-server')
const jwt = require('jsonwebtoken')
const axios = require('axios')

/**
 * A test server that serves up test json data and that can
 * protect that data if needed. A request must have an Authorization
 * header to access the data.
 *
 * User can sign in anonymously and an authorization token will be created.
 * The token will last for one hour after which the user has to
 * log in again. It does not automatically extend.
 *
 * The user can sign in using a google access token and expiration
 * (obtained by using the OAUTH2 implicit flow in the web client).
 * If the token is valid (determined by calling the google token
 * info server) a server token is created using the expiration as the
 * length of the token. 
 */

// Key for signing JWT tokens. DO NOT DO THIS IN A PRODUCTION APP.
const JWT_KEY = 'HowNowBrownCow'

// Set up the json server
const server = jsonServer.create()
const router = jsonServer.router('temp_db.json')
const middlewares = jsonServer.defaults()
server.use(middlewares)

// allow custom routes to use json-server's body parser
server.use(jsonServer.bodyParser)

// With the advent of the SameSite attribute of cookies, added support
// for the token in the Authorization header.
server.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(
        token,
        JWT_KEY
      )
      req.currentUser = payload;
    } catch (err) {
      // most likely token has expires. Could also be tampering with
      // token but this is a test application so it does not really
      // matter.
    }
  }  
  next();
})

// Simple signout route. Now a noop as cookie sessions no longer
// supported. 
server.get('/authout', (req, res) => {
  res.sendStatus(200)
})

// Verify if user is logged in route. Determined by presence of
// currentUser in request (set up by earlier middeleware).
// The client uses this at initialization time to deterine if a
// session already exists
server.get('/auth', (req, res) => {
  if (req.currentUser) {
    res.send(req.currentUser)
  } else {
    res.sendStatus(401)
  }
})

// Log the user in.
// If the client provides a google access token it will be validated.
// Otherwise the user will be logged in anonymously.
server.post('/auth', async (req, res) => {
  const { type, access_token, expires_in, name, id } = req.body
  if (type === 'Google') {
    // For google login, verify the access token.
    // If access token is not valid return a 401.
    try {
      const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${access_token}`)
      if (response.status !== 200) {
        res.status(401)
        return
      }
    } catch (error) {
      res.status(401)
      return
    }
  }
  // In theory the id would be used to check if the user is
  // authorized to access the data server. As this is just
  // sample code we just grant access. Log the login though.
  console.log(`${name}/${id} authorized to use the JSON server`)
  // Create the JWT token for the session. Use the expires
  // provided (google provides some value) or default to an
  // hour. This is a very simple app, no proviso is built
  // in to handle a token being invalidated before the JWT
  // token expires.
  const options = {
    expiresIn: expires_in ? parseInt(expires_in) : 3600
  }
  const userJwt = jwt.sign(
    { ...req.body },
    JWT_KEY,
    options
  );
  res.status(200).send({...req.body, jwt_token: userJwt});
})

// All data requests go through this guard first.
// If currentUser is not found on the request (see
// above for how that happens), the user is not logged in
// and a 401 response is returned.
server.use((req, res, next) => {
  // If currentUser is present, user is authorized
  if (req.currentUser) {
    next()
  } else {
    res.sendStatus(401)
  }
})

// The json server data routes
server.use(router)

// Start listening on port 3000
server.listen(3000, () => {
  console.log('JSON Server is listening on port 3000')
})
