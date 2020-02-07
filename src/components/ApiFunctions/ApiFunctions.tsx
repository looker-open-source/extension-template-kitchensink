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

import React, { useContext, useEffect } from "react"
import { Heading, Box, Paragraph } from "@looker/components"
import styled from "styled-components"
import { ExtensionButton } from "../ExtensionButton"
import { ApiFunctionsProps } from "./types"
import {
  ExtensionContext,
  ExtensionContextData
} from "@looker/extension-sdk-react"
import { ExtensionHostApi } from "@looker/extension-sdk"

export const ApiFunctions: React.FC<ApiFunctionsProps> = () => {
  const [messages, setMessages] = React.useState("")
  const [sandboxStatus, setSandboxStatus] = React.useState("")
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const extensionHost = extensionContext.extensionSDK as ExtensionHostApi

  useEffect(() => {
    try {
      const parentWindow:any = (window as any).parent
      console.log(parentWindow.looker?.version)
      setSandboxStatus("NOT")
    }catch(err) {
      setSandboxStatus("")
    }
  }, [])

  const updateMessages = (message: string) => {
    setMessages(prevMessages => {
      const maybeLineBreak = prevMessages.length === 0 ? '' : '\n'
      return `${prevMessages}${maybeLineBreak}${message}`
    })
  }

  const buttonClick = () => {
    extensionHost
      .verifyHostConnection()
      .then(value => {
        if (value === true) {
          updateMessages("Host verification success")
        } else {
          updateMessages("Invalid response " + value)
        }
      })
      .catch(error => {
        updateMessages("Host verification failure")
        updateMessages(error)
        console.error("Host verification failure", error)
      })
  }

  const updateTitleButtonClick = () => {
    const date = new Date()
    extensionHost.updateTitle(
      `Extension Title Update ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    )
    updateMessages("Title updated")
  }

  const goToBrowseButtonClick = () => {
    extensionHost.updateLocation("/browse")
  }

  const goToMarketplaceButtonClick = () => {
    extensionHost.updateLocation("/marketplace")
  }

  const openMarketplaceButtonClick = () => {
    extensionHost.openBrowserWindow("/marketplace", "_marketplace")
    updateMessages("Window opened")
  }

  const localStorageSet = () => {
    extensionHost
      .localStorageSetItem("testbed", new Date().toString())
      .then(() => {
        updateMessages("Success")
      })
      .catch(error => {
        updateMessages(error)
        console.error(error)
      })
  }

  const localStorageGet = () => {
    extensionHost
      .localStorageGetItem("testbed")
      .then(value => {
        updateMessages(value || "null")
      })
      .catch(error => {
        updateMessages(error)
        console.error(error)
      })
  }

  const localStorageRemove = () => {
    extensionHost
      .localStorageRemoveItem("testbed")
      .then(() => {
        updateMessages("Success")
      })
      .catch(error => {
        updateMessages(error)
        console.error(error)
      })
  }

  const clearMessagesClick = () => {
    setMessages('')
  }

  return (
    <>
      <Heading mt="xlarge">API Functions</Heading>
      <Paragraph my="medium">This extension is <b>{sandboxStatus}</b> sandboxed.</Paragraph>
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" width="50%">
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
          <ExtensionButton mt="small" variant="outline" onClick={buttonClick}>
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
            onClick={clearMessagesClick}
          >
            Clear messages
          </ExtensionButton>
        </Box>
        <Box width="50%" pr="large">
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
