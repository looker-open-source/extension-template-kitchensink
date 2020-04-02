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

import React, { useContext } from "react"
import { Heading, Box } from "@looker/components"
import styled from "styled-components"
import { ExtensionButton } from "../ExtensionButton"
import { SandboxStatus } from "../SandboxStatus"
import {
  ExtensionContext,
  ExtensionContextData,
  getCore40SDK
} from "@looker/extension-sdk-react"

export const CoreSDKFunctions = () => {
  const [messages, setMessages] = React.useState("")
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const sdk = extensionContext.core40SDK

  const updateMessages = (message: string, error?: any) => {
    setMessages(prevMessages => {
      const maybeLineBreak = prevMessages.length === 0 ? '' : '\n'
      const fullMessage = error ? `${message}\n${error}` : message
      return `${prevMessages}${maybeLineBreak}${fullMessage}`
    })
  }

  const allConnectionsClick = () => {
      sdk.all_connections()
      .then((response) => {
        if (response.ok) {
          response.value.forEach(connection => {
            updateMessages(connection.name || '')
          })
        } else {
          updateMessages('Error getting connections', response.error)
        }
      })
      .catch(error => updateMessages('Error caught getting connections', error))
  }

  const searchFoldersClick = () => {
    sdk.search_folders({ parent_id: '1'})
    .then((response) => {
      if (response.ok) {
        updateMessages(JSON.stringify(response.value, null, 2))
      } else {
        updateMessages('Error invoking search folders', response.error)
      }
    })
    .catch(error => updateMessages('Error caught invoking search folders', error))
  }

  const inlineQueryClick = () => {
    // alternate mechanism to get sdk. Note getCore31SDK is also available
    // but getCore40SDK provides access to newer functionality
    getCore40SDK()
      .run_inline_query({
        result_format: "json_detail",
        limit: 10,
        body: {
          total: true,
          model: "thelook",
          view: "users",
          fields: ["last_name", "gender"],
          sorts: [`last_name desc`]
        }
      })
      .then((response) => {
        if (response.ok) {
          updateMessages(JSON.stringify(response.value, null, 2))
        } else {
          updateMessages('Error invoking inline query', response.error)
        }
      })
      .catch(error => updateMessages('Error caught invoking inline query', error))
  }

  const clearMessagesClick = () => {
    setMessages('')
  }

  return (
    <>
      <Heading mt="xlarge">Core SDK Functions</Heading>
      <SandboxStatus/>
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" width="50%" maxWidth='40vw'>
          <ExtensionButton
              mt="small"
              variant="outline"
              onClick={allConnectionsClick}
            >
            All connections (get method)
          </ExtensionButton>
          <ExtensionButton
              mt="small"
              variant="outline"
              onClick={searchFoldersClick}
            >
            Search folders (get method with parameters)
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={inlineQueryClick}
          >
            Inline query (post method)
          </ExtensionButton>
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={clearMessagesClick}
          >
            Clear messages
          </ExtensionButton>
        </Box>
        <Box width="50%" pr="large" maxWidth='40vw'>
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
