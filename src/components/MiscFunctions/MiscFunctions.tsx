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

import React, { useContext, useState } from 'react'
import { Heading, Box, Paragraph } from '@looker/components'
import styled from 'styled-components'
import { ExtensionButton } from '../ExtensionButton'
import { SandboxStatus } from '../SandboxStatus'
import { MiscFunctionsProps } from './types'
import {
  ExtensionContext,
  ExtensionContextData,
} from '@looker/extension-sdk-react'
import { ExtensionHostApi } from '@looker/extension-sdk'

export const MiscFunctions: React.FC<MiscFunctionsProps> = () => {
  const [messages, setMessages] = useState('')
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const extensionSDK = extensionContext.extensionSDK as ExtensionHostApi

  const updateMessages = (message: string) => {
    setMessages((prevMessages) => {
      const maybeLineBreak = prevMessages.length === 0 ? '' : '\n'
      return `${prevMessages}${maybeLineBreak}${message}`
    })
  }

  const createAndSubmitForm = () => {
    // DO NOT DO THIS!
    // The following demonstrates the extension being reloaded
    // should an attempt to navigate away occur. This includes
    // form submissions.
    const form = document.createElement('form')
    document.body.appendChild(form)
    form.submit()
  }

  const navigateAwayClick = () => {
    updateMessages('Change extension window location')
    createAndSubmitForm()
  }

  const clearMessagesClick = () => {
    setMessages('')
  }

  const logout = () => {
    extensionSDK.spartanLogout()
  }

  return (
    <>
      <Heading mt="xlarge">Miscellaneous Functions</Heading>
      <SandboxStatus />
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" width="50%" maxWidth="40vw">
          <Paragraph>
            Clicking the button below will cause the extension to try and
            navigate to a new location within the extension window (not the
            owning window for which there is an extension SDK method). This is
            not allowed (extensions MUST be single page applications). The
            extension will be reloaded if window location does change.
          </Paragraph>
          <Paragraph>
            A circuit breaker has been built into the extension reload
            functionality. Should an extension attempt to change location more
            than 3 times in a 30 second window, the extension will NOT be
            reloaded and an error message will be displayed. You can simulate
            this by pressing the button 4 times within the 30 second window (you
            have to wait for the extension to reload).
          </Paragraph>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={navigateAwayClick}
          >
            Change extension window location
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={clearMessagesClick}
          >
            Clear messages
          </ExtensionButton>
          <ExtensionButton onClick={logout}>
            Logout of Looker (only in /spartan mode)
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
