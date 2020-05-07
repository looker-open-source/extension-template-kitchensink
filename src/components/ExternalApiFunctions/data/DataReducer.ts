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

export const initialState = {
  postsServer: "http://127.0.0.1:3000",
  posts: [],
  name: "",
  title: "",
  errorMessage: undefined
}

enum Action {
  updatePosts,
  updateName,
  updateTitle,
  updateErrorMessage,
  updatePostsServer,
}

export const reducer = (state: any, action: any) => {
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
    default:
      return state
  }
}

export const updatePosts = (dispatch: Dispatch<any>, posts: any[]) => dispatch({ type: Action.updatePosts, payload: posts })

export const updateName = (dispatch: Dispatch<any>, name: string) => dispatch({ type: Action.updateName, payload: name })

export const updateTitle = (dispatch: Dispatch<any>, title: string) => dispatch({ type: Action.updateTitle, payload: title })

export const updateErrorMessage = (dispatch: Dispatch<any>, errorMessage?: string) => dispatch({ type: Action.updateErrorMessage, payload: errorMessage })

export const updatePostsServer = (dispatch: Dispatch<any>, postsServer: string) => dispatch({ type: Action.updatePostsServer, payload: postsServer })
