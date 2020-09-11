/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 Looker Data Sciences, Inc.
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

import React, { useContext, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Heading, Box } from '@looker/components'
import styled from 'styled-components'
import { ExtensionButton } from '../ExtensionButton'
import { SandboxStatus } from '../SandboxStatus'
import { ApiFunctionsProps } from './types'
import {
  ExtensionContext,
  ExtensionContextData,
} from '@looker/extension-sdk-react'
import { ROUTES } from '../../KitchenSink'

export const ApiFunctions: React.FC<ApiFunctionsProps> = () => {
  const history = useHistory()
  const [messages, setMessages] = useState('')
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const { extensionSDK } = extensionContext

  const updateMessages = (message: string) => {
    setMessages((prevMessages) => {
      const maybeLineBreak = prevMessages.length === 0 ? '' : '\n'
      return `${prevMessages}${maybeLineBreak}${message}`
    })
  }

  const verifyHostConnectionClick = async () => {
    try {
      const value = await extensionSDK.verifyHostConnection()
      if (value === true) {
        updateMessages('Host verification success')
      } else {
        updateMessages('Invalid response ' + value)
      }
    } catch (error) {
      updateMessages('Host verification failure')
      updateMessages(error)
      console.error('Host verification failure', error)
    }
  }

  const updateTitleButtonClick = () => {
    const date = new Date()
    extensionSDK.updateTitle(
      `Extension Title Update ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    )
    updateMessages('Title updated')
  }

  const goToBrowseButtonClick = () => {
    extensionSDK.updateLocation('/browse')
  }

  const goToMarketplaceButtonClick = () => {
    extensionSDK.updateLocation('/marketplace')
  }

  const openMarketplaceButtonClick = () => {
    extensionSDK.openBrowserWindow('/marketplace', '_marketplace')
    updateMessages('Window opened')
  }

  const localStorageSet = async () => {
    try {
      await extensionSDK.localStorageSetItem('testbed', new Date().toString())
      updateMessages('Success')
    } catch (error) {
      updateMessages(error)
      console.error(error)
    }
  }

  const localStorageGet = async () => {
    try {
      const value = await extensionSDK.localStorageGetItem('testbed')
      updateMessages(value || 'null')
    } catch (error) {
      updateMessages(error)
      console.error(error)
    }
  }

  const localStorageRemove = async () => {
    try {
      await extensionSDK.localStorageRemoveItem('testbed')
      updateMessages('Success')
    } catch (error) {
      updateMessages(error)
      console.error(error)
    }
  }

  const trackActionClick = () => {
    extensionSDK.track('click', 'kitchensink-action-tracked')
    updateMessages('Action tracked')
  }

  const generateUnhandledErrorClick = () => {
    updateMessages('About to generate error')
    // const badApi: any = {}
    // badApi.noExistentMethod()
    throw new Error('Kitchensink threw an error')
  }

  const testRouting = () => {
    history.push(`${ROUTES.CORESDK_ROUTE}?test=abcd`, { count: 1 })
  }

  const getUserAttributeClick = async () => {
    try {
      const value = await extensionSDK.userAttributeGetItem('user_value')
      updateMessages(`User attribute 'user_value' is ${value}`)
    } catch (error) {
      const name = `${extensionSDK.lookerHostData?.extensionId.replace('::', '_')}_user_value`
      updateMessages(`Create a user attribute named "${name}" and reload to use this attribute`)
      console.error(error)
    }
    try {
      const value = await extensionSDK.userAttributeGetItem('locale')
      updateMessages(`User attribute 'locale' is ${value}`)
    } catch (error) {
      updateMessages(error)
      console.error(error)
    }
  }

  const setUserAttributeClick = async () => {
    try {
      const value = await extensionSDK
        .userAttributeSetItem('user_value', new Date().toString())
      if (value) {
        updateMessages(`Updated 'user_value' to '${value}'`)
      }
    } catch (error) {
        const name = `${extensionSDK.lookerHostData?.extensionId.replace('::', '_')}_user_value`
        updateMessages(`Create a user attribute named "${name}" and reload to use this attribute`)
        console.error(error)
    }
    // This will fail because global user attributes cannot by modified by an extension
    try {
      const timestamp = new Date().toString()
      const value = await extensionSDK.userAttributeSetItem('locale', timestamp)
      if (value) {
        updateMessages(`Updated 'locale' to '${timestamp}'`)
      }
    } catch (error) {
      updateMessages(error)
      console.error(error)
    }
  }

  const resetUserAttributeClick = async () => {
    try {
      await extensionSDK.userAttributeResetItem('user_value')
      updateMessages(`Reset 'user_value' to default`)
    } catch (error) {
      const name = `${extensionSDK.lookerHostData?.extensionId.replace('::', '_')}_user_value`
      updateMessages(`Create a user attribute named "${name}" and reload to use this attribute`)
      console.error(error)
    }
    // This will fail because global user attributes cannot by modified by an extension
    try {
      await extensionSDK.userAttributeResetItem('locale')
      updateMessages(`Reset 'locale' default`)
    } catch (error) {
      updateMessages(error)
      console.error(error)
    }
  }

  const clearMessagesClick = () => {
    setMessages('')
  }

  return (
    <>
      <Heading mt="xlarge">API Functions</Heading>
      <SandboxStatus />
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" width="50%" maxWidth="40vw">
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={updateTitleButtonClick}
          >
            Update title
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={goToBrowseButtonClick}
          >
            Go to browse (update location)
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={goToMarketplaceButtonClick}
          >
            Go to Marketplace (update location)
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={openMarketplaceButtonClick}
          >
            Open marketplace new window
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={verifyHostConnectionClick}
          >
            Verify host connection
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={localStorageSet}
          >
            Set local storage
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={localStorageGet}
          >
            Get local storage
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={localStorageRemove}
          >
            Remove local storage
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={trackActionClick}
          >
            Pinger action
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={generateUnhandledErrorClick}
          >
            Generate unhandled error
          </ExtensionButton>
          <ExtensionButton mt="small" variant="outline" onClick={testRouting}>
            Route test
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={getUserAttributeClick}
          >
            Get User Attribute
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={setUserAttributeClick}
          >
            Set User Attribute
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={resetUserAttributeClick}
          >
            Reset User Attribute
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={clearMessagesClick}
          >
            Clear messages
          </ExtensionButton>
        </Box>
        <Box width="50%" pr="large" maxWidth="40vw">
          <StyledPre>{messages}</StyledPre>
        </Box>
      </Box>
    </>
  )
}

const StyledPre = styled.pre`
  margin: 0 0 0 20px;
  border: 1px solid #c1c6cc;
  height: 100%;
  padding: 20px;
`
