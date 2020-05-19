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

import { Dispatch } from 'react'

/**
 * Centralized data for extanal API demos. Use react useReducer hooks.
 */

 // Initial stats
export const initialState: DataState = {
  postsServer: "http://127.0.0.1:3000",
  posts: [],
  name: "",
  title: "",
  errorMessage: undefined,
  authorized: false
}

// The state interface
export interface DataState {
  postsServer: string
  posts: any[]
  name: string
  title: string
  errorMessage?: string
  authorized: boolean
  authOption?: AuthOption
  sheetData?: any[]
}

// Supported actions
enum Action {
  updatePosts,
  updateName,
  updateTitle,
  updateErrorMessage,
  updatePostsServer,
  authorize,
  updateSheetData,
}

// Authorization options
export enum AuthOption {
  None = "none",
  Google = "Google",
  Github = "Github"
}

// The reducer
export const reducer = (state: DataState, action: any) => {
  const { type, payload } = action
  switch (type) {
    case Action.updatePosts:
      return {
        ...state,
        posts: payload
      }
    case Action.updateName:
      return {
        ...state,
        name: payload
      }
    case Action.updateTitle:
      return {
        ...state,
        title: payload
      }
    case Action.updateErrorMessage:
      return {
        ...state,
        errorMessage: payload
      }
    case Action.updatePostsServer:
      return {
        ...state,
        postsServer: payload
      }
    case Action.updateSheetData:
      return {
        ...state,
        sheetData: payload
      }
    case Action.authorize:
      return {
        ...state,
        posts: [],
        sheetData: undefined,
        title: '',
        errorMessage: undefined,
        authOption: payload.authOption,
        authorized: payload.authorized
      }
    default:
      return state
  }
}

/**
 * Update posts
 * @param dispatch
 * @param posts
 */
export const updatePosts = (dispatch: Dispatch<any>, posts: any[]) => dispatch({ type: Action.updatePosts, payload: posts })

/**
 * Update name of poster
 * @param dispatch
 * @param name
 */
export const updateName = (dispatch: Dispatch<any>, name: string) => dispatch({ type: Action.updateName, payload: name })

/**
 *
 * @param dispatch Update title of post
 * @param title
 */
export const updateTitle = (dispatch: Dispatch<any>, title: string) => dispatch({ type: Action.updateTitle, payload: title })

/**
 * Update error message
 * @param dispatch
 * @param errorMessage
 */
export const updateErrorMessage = (dispatch: Dispatch<any>, errorMessage?: string) => dispatch({ type: Action.updateErrorMessage, payload: errorMessage })

/**
 * Update url of posts server
 * @param dispatch
 * @param postsServer
 */
export const updatePostsServer = (dispatch: Dispatch<any>, postsServer: string) => dispatch({ type: Action.updatePostsServer, payload: postsServer })

/**
 * Update sheet data
 * @param dispatch
 * @param sheetData
 */
export const updateSheetData = (dispatch: Dispatch<any>, sheetData: any[]) => dispatch({ type: Action.updateSheetData, payload: sheetData })

/**
 * Authorize or deauthorize user
 * @param dispatch
 * @param authorized or not - true/false
 * @param authOption type of authorization
 */
export const authorize = (dispatch: Dispatch<any>, authorized: boolean, authOption = AuthOption.None) =>
  dispatch({ type: Action.authorize, payload: { authOption, authorized } })
