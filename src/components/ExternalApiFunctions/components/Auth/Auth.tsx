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

import React, { useContext, useEffect, useState } from "react"
import { useHistory, useLocation } from 'react-router-dom'
import { Box, Button, ButtonOutline, Dialog, Heading, ModalContent, SpaceVertical, Text } from "@looker/components"
import {
  ExtensionContext,
  ExtensionContextData
} from "@looker/extension-sdk-react"
import { AuthProps } from "./types"
import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES } from '../..'
import { authorize, AuthOption, updateErrorMessage, updateName } from '../../data/DataReducer'
import { extractMessageFromError } from '../../../../utils/extract_message_from_error'
import { getDataServerFetchProxy } from '../../utils/fetch_proxy'


/**
 * Authorization component. Monitors whether a user is signed in or not.
 * Provides options for a user to sign in.
 * User can sign in without any authentication.
 * User can sign in using Google OAUTH2
 */
export const Auth: React.FC<AuthProps> = ({dataState, dataDispatch}) => {
  // Get access to the extension SDK and the looker API SDK.
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const { extensionSDK, core40SDK } = extensionContext
  const dataServerFetchProxy = getDataServerFetchProxy(extensionSDK)

  // Dialog state
  const [ dialogOpen, setDialogOpen ] = useState(false)

  // Component data state
  const { authorized, authOption, postsServer, name } = dataState

  // React router setup
  const history = useHistory()
  const location = useLocation()

  // First time setup
  useEffect(() => {
    const initialize = async () => {
      const authorized = await dataServerAuthCheck()
      const { authOption, googleAccessToken } = location.state as any || {}
      if ((!authOption || !authorized)) {
        // Client key checks. If not defined inform user that there is missing setup
        if (GOOGLE_CLIENT_ID === '') {
          updateErrorMessage(dataDispatch, 'Google client id has not been defined. Please see README.md for instructions.')
        }
      }
      if (authOption) {
        authorize(dataDispatch, authorized, authOption)
      } else {
        authorize(dataDispatch, authorized, AuthOption.None)
      }
      if (authorized) {
        getUserInfo(authOption || AuthOption.None, googleAccessToken)
      }
    }
    initialize()
  }, [])

  // Store the current authOption in push state. This allows the extension to restore
  // the current authOption if the page is reloaded.
  useEffect(() => {
    const { authOption } = location.state as any || {}
    if (authOption !== dataState.authOption) {
      history.replace(location.pathname, { ...location.state, authOption: dataState.authOption }  )
    }
  }, [dataState])

  // Check to see if the users data server session is valid
  const dataServerAuthCheck = async (): Promise<boolean> => {
    try {
      let response = await dataServerFetchProxy.fetchProxy(`${postsServer}/auth`)
      return response.ok
    } catch(error) {
      // If a failure is caught assume server not started. fetchPosts
      // will display appropriate message/
      console.error(error)
      return false
    }
  }

  // Log the user into to data server. This creates a JWT token that is
  // stored in a cookie.
  // For anonymous logins, the session token is just created.
  // For google logins, the data server validates the access token by calling
  // out to google.
  const dataServerAuth = async (body: any): Promise<boolean> => {
    try {
      const response = await dataServerFetchProxy.fetchProxy(
        `${postsServer}/auth`,
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      )
      return response.ok
    } catch(error) {
      console.error(error)
      return false
    }
  }

  // Log out of the data server
  const dataServerAuthOut = async (): Promise<void> => {
    try {
      dataServerFetchProxy.fetchProxy(`${postsServer}/authout`)
    } catch(error) {
      console.error(error)
    }
    updateName(dataDispatch, "")
  }

  // Toggle to change authorization. If logged in the user is logged out.
  // If not logged in the authorization dialog is displayed.
  const changeAuthorization = async () => {
    if (authorized) {
      await dataServerAuthOut()
      authorize(dataDispatch, false, AuthOption.None)
      history.replace(location.pathname, { authOption: AuthOption.None }  )
    } else {
      setDialogOpen(true)
    }
  }

  // Sign in using the authorization option of choice. choices are:
  // 1. anonymous - just logs into the data server. there is no validation. a session is created.
  // 2. google - uses oauth2 to login into google and get an access token. The access token is
  //    validated by the data server.
  const signin = async (authOption: AuthOption) => {
    setDialogOpen(false)
    if (authOption === AuthOption.Google) {
      // Google login
      try {
        const response = await extensionSDK.oauth2Authenticate("https://accounts.google.com/o/oauth2/v2/auth", {
          client_id: GOOGLE_CLIENT_ID,
          scope: GOOGLE_SCOPES,
          response_type: 'token'
        })
        const { access_token, expires_in } = response
        // Get information about the just logged in user
        const { id, name } = await getUserInfo(AuthOption.None, access_token)
        // Log into the data server. Pass in the id from from google. The data server
        // can use the id to verify if the user is authorized to use the data server
        // (it doesn't but it could).
        const loginDataServer = await dataServerAuth({
          type: authOption,
          access_token,
          expires_in,
          name,
          id
        })
        if (loginDataServer) {
          // Save the google access token in push state. This is needed for the sheets demo.
          history.replace(location.pathname, { ...location.state, googleAccessToken: access_token }  )
          authorize(dataDispatch, true, authOption)
        } else {
          updateErrorMessage(dataDispatch, "Login failed")
        }
      } catch(error) {
        const errorMessage = extractMessageFromError(error)
        if (errorMessage.startsWith("Extension not entitled to access external oauth2 API url")) {
          updateErrorMessage(dataDispatch, "Please add 'https://accounts.google.com/o/oauth2/v2/auth' to the extensions oauth2_urls entitlements")
        } else {
          updateErrorMessage(dataDispatch, "Login failed")
          console.error("failed to login", error)
        }
      }
    } else {
      const { id, name } = await getUserInfo(AuthOption.None)
      try {
        // Semi anonymous login
        const loginDataServer = await dataServerAuth({
          type: authOption,
          name,
          id
        })
        if (loginDataServer) {
          authorize(dataDispatch, true, authOption)
        } else {
          updateErrorMessage(dataDispatch, "Login failed")
        }

      } catch(error) {
        updateErrorMessage(dataDispatch, "Login failed")
        console.error("failed to login", error)
      }
    }
  }

  // Close the dialog
  const closeDialog = () => {
    setDialogOpen(false)
  }

  const getUserInfo = async (authOption: AuthOption, accessToken?: string) => {
    let name
    let id
    try {
      if (authOption === AuthOption.Google) {
        // Get information about user from google
        const userInfoResponse = await extensionSDK.fetchProxy(`https://www.googleapis.com/oauth2/v2/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        if (userInfoResponse.ok) {
          name = userInfoResponse.body?.name || 'Unknown'
          id = userInfoResponse.body?.id || 'Unknown'
        } else {
          name = 'Unknown'
          id = 'Unknown'
        }
      } else {
        // Get information about user from Looker
        const value = await core40SDK.ok(core40SDK.me())
        name = value.display_name || "Unknown"
        id = value.id || "Unknown"
      }
    } catch (error) {
      name = "Unknown"
      id =  "Unknown"
    }
    updateName(dataDispatch, name)
    return { id, name }
  }

  // Create message describing what kind of authorization is in use
  let authMessage = ''
  if (authorized) {
    switch(authOption) {
      case AuthOption.Google:
        authMessage = `${name}, you are authorized using Google`
        break
      case AuthOption.Github:
        authMessage = `${name}, you are authorized using Github`
        break
      default:
        authMessage = `${name}, you are authorized`
    }
  } else {
    authMessage = 'You are not authorized!'
  }

  return (
    <Box display="flex" flexDirection="row" width="100%" justifyContent="space-between" alignItems="center">
      <Text>{authMessage}</Text>
      <Button onClick={changeAuthorization}>{authorized ? 'Sign out' : 'Sign in'}</Button>
      <Dialog isOpen={dialogOpen} onClose={closeDialog} width="50vw">
        <ModalContent>
          <Heading>Choose an authentication method</Heading>
          <SpaceVertical mt="xlarge" mb="large">
            <ButtonOutline width="100%" onClick={signin.bind(null, AuthOption.None)}>Sign in</ButtonOutline>
            <ButtonOutline width="100%" onClick={signin.bind(null, AuthOption.Google)} disabled={GOOGLE_CLIENT_ID === ''}>Sign with Google</ButtonOutline>
          </SpaceVertical>
        </ModalContent>
      </Dialog>
    </Box>
  )
}
