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

import isEqual from 'lodash/isEqual'
import React, { useContext, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Heading, Box } from '@looker/components'
import styled from 'styled-components'
import { ExtensionButton } from '../ExtensionButton'
import { SandboxStatus } from '../SandboxStatus'
import {
  ExtensionContext,
  ExtensionContextData,
  getCore40SDK,
} from '@looker/extension-sdk-react'

export const CoreSDKFunctions = () => {
  const [imageData, setImageData] = useState<string>()
  const location = useLocation()
  const [routeData, setRouteData] = useState<any>({})
  const [messages, setMessages] = useState('')
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const sdk = extensionContext.core40SDK
  const sdk31 = extensionContext.core31SDK
  const extensionSDK = extensionContext.extensionSDK

  useEffect(() => {
    if (location.search || location.pathname.includes('?')) {
      const route = `${location.pathname}${location.search}`
      if (
        routeData.route !== route ||
        !isEqual(routeData.routeState, location.state)
      ) {
        setRouteData({ route, routeState: location.state })
        updateMessages(
          `location: ${location.pathname}${location.search} ${JSON.stringify(
            location.state
          )}`
        )
      }
    }
  }, [location])

  const updateMessages = (message: string, error?: any) => {
    setMessages((prevMessages) => {
      const maybeLineBreak = prevMessages.length === 0 ? '' : '\n'
      const fullMessage = error ? `${message}\n${error}` : message
      return `${prevMessages}${maybeLineBreak}${fullMessage}`
    })
  }

  const allConnectionsClick = async () => {
    try {
      const value = await sdk.ok(sdk.all_connections())
      value.forEach((connection) => {
        updateMessages(connection.name || '')
      })
    } catch (error) {
      updateMessages('Error getting connections', error)
    }
  }

  const rawLookImageClick = async () => {
    try {
      const looks = await sdk.ok(sdk.all_looks('id'))
      if (looks.length > 0) {
        const value: any = await sdk.ok(
          sdk.run_look({
            look_id: looks[0].id!,
            result_format: 'png',
          })
        )
        if (value instanceof Blob) {
          setImageData(URL.createObjectURL(value))
        } else {
          setImageData(btoa(`data:image/png;base64,${value}`))
        }
        updateMessages('Got image')
      } else {
        updateMessages('No looks to render')
      }
    } catch (error) {
      updateMessages('Error getting connections', error)
    }
  }

  const searchFoldersClick = async () => {
    try {
      const value = await sdk.ok(sdk.search_folders({ parent_id: '1' }))
      updateMessages(JSON.stringify(value, null, 2))
    } catch (error) {
      updateMessages('Error invoking search folders', error)
    }
  }

  const inlineQueryClick = async () => {
    // alternate mechanism to get sdk. Note getCore31SDK is also available
    // but getCore40SDK provides access to newer functionality
    const core40SDK = getCore40SDK()
    try {
      const value = await core40SDK.ok(
        core40SDK.run_inline_query({
          result_format: 'json_detail',
          limit: 10,
          body: {
            total: true,
            model: 'thelook',
            view: 'users',
            fields: ['last_name', 'gender'],
            sorts: [`last_name desc`],
          },
        })
      )
      updateMessages(JSON.stringify(value, null, 2))
    } catch (error) {
      updateMessages('Error invoking inline query', error)
    }
  }

  const clearMessagesClick = () => {
    setMessages('')
    setImageData(undefined)
  }

  return (
    <>
      <Heading mt="xlarge">Core SDK Functions</Heading>
      <SandboxStatus />
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="column" width="50%" maxWidth="40vw">
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
            onClick={rawLookImageClick}
          >
            Render Look image
          </ExtensionButton>
          {imageData && <img src={imageData} />}
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
