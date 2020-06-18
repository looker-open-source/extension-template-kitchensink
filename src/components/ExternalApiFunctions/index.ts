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

export * from "./ExternalApiFunctions"
export * from "./types"

// Authorization options
export enum AuthOption {
  Custom = "Custom",
  Google = "Google",
  Github = "Github",
  Auth0 = "Auth0"
}  

// Posts server

export const POSTS_SERVER_URL = process.env.POSTS_SERVER_URL || 'http://127.0.0.1:3000'

// Centralize setup of client ids, keys and scopes

// The Google client id should be defined in the .env file. See README.md
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
export const GOOGLE_SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/userinfo.profile";

// The Github client id should be defined in the .env file. See README.md
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || ''
// Temporary. Will eventually be stored in the server. For the moment
// define in the .env file
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || ''

// The Auth0 client id should be defined in the .env file. See README.md
export const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || ''
// Temporary. Will eventually be stored in the server. For the moment
// define in the .env file
export const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || ''
// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
export const AUTH0_SCOPES = "openid profile email https://www.googleapis.com/auth/spreadsheets.readonly"
// Auth0 will provide a domain to use for OAUTH authentication.
export const AUTH0_BASE_URL = process.env.AUTH0_BASE_URL || ''
