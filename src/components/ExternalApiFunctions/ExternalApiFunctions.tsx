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
import { ExternalApiFunctionsProps } from "./types"
import {
  ExtensionContext,
  ExtensionContextData
} from "@looker/extension-sdk-react"
import { ExtensionHostApi, ExtensionApiProxyResponse } from "@looker/extension-sdk"

export const ExternalApiFunctions: React.FC<ExternalApiFunctionsProps> = () => {
  const [messages, setMessages] = React.useState("")
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const extensionHost = extensionContext.extensionSDK as ExtensionHostApi

  const updateMessages = (message: string) => {
    setMessages(prevMessages => {
      const maybeLineBreak = prevMessages.length === 0 ? '' : '\n'
      return `${prevMessages}${maybeLineBreak}${message}`
    })
  }

  const handleSuccess = (response: ExtensionApiProxyResponse) => {
    const body = typeof response.body === 'string' ? response.body as string : JSON.stringify(response.body, null, 2)
    updateMessages(`status=${response.status}`)
    updateMessages(`status text=${response.status_text}`)
    updateMessages(`header count=${response.headers.length}`)
    updateMessages(`body=${body}`)
  }

  const data: Record<string, any> = {
    GET: {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      headers: [
        {name: 'x-client', value: 'extension'},
        {name: 'x-method', value: 'GET'}
      ],
    },
    HEAD: {
      url: 'https://jsonplaceholder.typicode.com/posts',
    },
    POST: {
      url: 'https://jsonplaceholder.typicode.com/posts',
      headers: [
        {name: 'x-client', value: 'extension'},
        {name: 'x-method', value: 'POST'},
        {name: 'content-type', value: 'application/json; charset=UTF-8'}
      ],
      body: {
        title: 'foo',
        body: 'bar',
        userId: 1
      },
    },
    PUT: {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      headers: [
        {name: 'x-client', value: 'extension'},
        {name: 'x-method', value: 'POST'},
        {name: 'content-type', value: 'application/json; charset=UTF-8'}
      ],
      body: {
        id: 1,
        title: 'foo',
        body: 'bar',
        userId: 1
      }
    },
    PATCH: {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      headers: [
        {name: 'x-client', value: 'extension'},
        {name: 'x-method', value: 'POST'},
        {name: 'content-type', value: 'application/json; charset=UTF-8'}
      ],
      body: {
        id: 1,
        title: 'foo',
        body: 'bar',
        userId: 1
      }
    },
    DELETE: {
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      headers: [
        {name: 'x-client', value: 'extension'},
        {name: 'x-method', value: 'DELETE'},
        {name: 'content-type', value: 'application/json; charset=UTF-8'}
      ],
    },
  }

  const handleError = (error: any) => {
    console.error(error)
    if (typeof error === 'string') {
      updateMessages(error)
    } else {
      updateMessages(JSON.stringify(error, null, 2))
    }
  }

  const externalApiRequest = (method: string) => {
    extensionHost
      .invokeExternalApi(data[method].url,
        method as any,
        data[method].body,
        data[method].headers)
      .then(handleSuccess)
      .catch(handleError)
  }

  const clearMessagesClick = () => {
    setMessages('')
  }

  return (
    <FunctionsContainer title="External API Functions" messages={messages} clearMessages={clearMessagesClick}>
      { Object.keys(data).map(key =>
        <ExtensionButton
          key={key}
          mt="small"
          variant="outline"
          onClick={externalApiRequest.bind(null, key)}
        >
          Invoke External API ({key})
        </ExtensionButton>
      )}
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
