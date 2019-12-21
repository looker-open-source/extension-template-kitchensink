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
import styled from "styled-components"
import { ExtensionButton } from "../ExtensionButton"
import { FunctionsContainer } from "../FunctionsContainer"
import {
  ExtensionContext,
  ExtensionContextData,
  getCoreSDK
} from "@looker/extension-sdk-react"

export const CoreSDKFunctions = () => {
  const [messages, setMessages] = React.useState("")
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const sdk = extensionContext.coreSDK

  const updateMessages = (message: string) => {
    setMessages(prevMessages => {
      const maybeLineBreak = prevMessages.length === 0 ? '' : '\n'
      return `${prevMessages}${maybeLineBreak}${message}`
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
          updateMessages('Error getting connections')
        }
      })
      .catch(error => updateMessages('Error getting connections'))
  }

  const searchFoldersClick = () => {
    sdk.search_folders({ parent_id: '1'})
    .then((response) => {
      if (response.ok) {
        updateMessages(JSON.stringify(response.value, null, 2))
      } else {
        updateMessages('Error invoking search folders')
      }
    })
    .catch(error => updateMessages('Error invoking search folders'))
  }

  const inlineQueryClick = () => {
    // alternate mechanism to get sdk.
    getCoreSDK()
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
          updateMessages('Error invoking inline query')
        }
      })
      .catch(error => updateMessages('Error invoking inline query'))
  }

  const clearMessagesClick = () => {
    setMessages('')
  }

  return (
    <FunctionsContainer title="Core SDK Functions" messages={messages} clearMessages={clearMessagesClick}>
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
    </FunctionsContainer>
  )
}

const StyledPre = styled.pre`
  margin: 0 0 0 20px;
  border: 1px solid #c1c6cc;
  height: 100%;
  padding: 20px;
  max-width: 40vw;
`
