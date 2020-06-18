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

import React, { useContext, useEffect } from "react"
import { useLocation } from 'react-router-dom'
import {
  ActionList,
  ActionListItemAction,
  ActionListColumns,
  ActionListItem,
  ActionListItemColumn,
  Box,
  Button,
  FieldText,
  Form,
  Text,
} from "@looker/components"
import { DataServerDemoProps } from "./types"
import {
  ExtensionContext,
  ExtensionContextData
} from "@looker/extension-sdk-react"
import {
  updatePosts,
  updateTitle,
} from '../../data/DataReducer'
import { handleResponse, handleError } from '../../utils/validate_data_response'
import { getDataServerFetchProxy } from '../../utils/fetch_proxy'
import {
  POSTS_SERVER_URL,
} from '../..'

/**
 * Demonstration of Looker extension SDK external API use, fetchProxy
 *
 * A note on state. This component is rendered in a tab panel and such
 * can get unloaded while an asynchronous operation is in progress. Rather
 * than attempt to update state in this component after the component is
 * unmounted and get a nasty message in the console, state is held in the
 * parent component. Thus if the component is unloaded, no messages appear
 * in the console. The added advantage is that data will be ready to
 * display should the component be remounted.
 *
 * A note on data. A simple json server is provided. This server must be
 * started in order for this demo to work.
 */
export const DataServerDemo: React.FC<DataServerDemoProps> = ({ dataDispatch, dataState }) => {
  // Get access to the extension SDK and the looker API SDK.
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const { extensionSDK } = extensionContext
  // React router location
  const location = useLocation()

  // Get state from the reducer
  const { posts, name, title } = dataState

  useEffect(() => {
    // First time in get the posts
    fetchPosts(true)
  }, [])

  // Handle creation of a post.
  const onCreatePostSubmit = async (event: React.FormEvent) => {
    // Need to prevent default processing for event from occurring.
    // The button is rendered in a form and default action is to
    // submit the form.
    event.preventDefault()

    try {
      // A more complex use of the fetch proxy. In this case the
      // content type must be included in the headers as the json server
      // will not process it otherwise.
      // Note the that JSON object in the string MUST be converted to
      // a string.
      const dataServerFetchProxy  = getDataServerFetchProxy(extensionSDK, location.state)
      let response = await dataServerFetchProxy.fetchProxy(
        `${POSTS_SERVER_URL}/posts`,
        {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            title,
            author: name
          })
        })
      if (handleResponse(response, dataDispatch, "Failed to create post")) {
        updateTitle(dataDispatch, "")
        fetchPosts()
      }
    } catch(error) {
      handleError(error, dataDispatch)
    }
  }

  // Handle deletion of a post message
  const onPostDelete = async (post: any) => {
    // Slightly more complex use of the fetch method. In this case
    // the DELETE method is used.
    try {
      const dataServerFetchProxy  = getDataServerFetchProxy(extensionSDK, location.state)
      let response = await dataServerFetchProxy.fetchProxy(
        `${POSTS_SERVER_URL}/posts/${post.id}`,
        {
          method: 'DELETE',
        })
      if (handleResponse(response, dataDispatch, "Failed to delete post")) {
        updateTitle(dataDispatch, "")
        fetchPosts()
      }
    }
    catch(error) {
      handleError(error, dataDispatch)
    }
  }

  // Fetch the posts
  const fetchPosts = async (firstTime = false) => {
    try {
      // Use the extension SDK external API fetch method. A simple GET call.
      // Note the response body is determined from the fetch response. The
      // fetch call can take a third argument that indicates what type of
      // response is expected.
      const dataServerFetchProxy  = getDataServerFetchProxy(extensionSDK, location.state)
      const response = await dataServerFetchProxy.fetchProxy(`${POSTS_SERVER_URL}/posts`)
      if (handleResponse(response, dataDispatch, undefined, firstTime)) {
        updatePosts(dataDispatch, response.body.reverse())
      }
    } catch(error) {
      handleError(error, dispatchEvent, firstTime)
    }
  }

  // Handle title change for a new post
  const onTitleChange = (e: any) => {
    updateTitle(dataDispatch, e.currentTarget.value)
  }

  // Post column definitions for action list
  const postsColumns = [
    {
      id: 'id',
      primaryKey: true,
      title: 'ID',
      type: 'number',
      widthPercent: 10,
    },
    {
      id: 'title',
      title: 'Title',
      type: 'string',
      widthPercent: 60,
    },
    {
      id: 'author',
      title: 'Author',
      type: 'string',
      widthPercent: 30,
    },
  ] as ActionListColumns

  // render posts action list columns
  const postsItems = posts.map((post: any) => {
    // Action column, posts may be deleted
    const actions = (
      <>
        <ActionListItemAction onClick={onPostDelete.bind(null, post)}>
          Delete
        </ActionListItemAction>
      </>
    )

    // The columns
    const { id, title, author } = post
    return (
      <ActionListItem key={id} id={id} actions={actions}>
        <ActionListItemColumn>{id}</ActionListItemColumn>
        <ActionListItemColumn>{title}</ActionListItemColumn>
        <ActionListItemColumn>{author}</ActionListItemColumn>
      </ActionListItem>
    )
  })

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" mb="medium" alignItems="baseline">
        <Text>Posts data is being served from {POSTS_SERVER_URL}</Text>
        <Box display="flex" flexDirection="row" alignItems="baseline">
          <Button ml="small" onClick={ () => fetchPosts() }>Refresh data</Button>
        </Box>
      </Box>
      <Box mb="medium" px="xlarge" pt="small" border="1px solid" borderColor="palette.charcoal200" borderRadius="4px">
        <Form onSubmit={onCreatePostSubmit}>
          <FieldText label="Title" name="title" value={title} onChange={onTitleChange} required />
          <Button disabled={title.length === 0}>Create Post</Button>
        </Form>
      </Box>
      <ActionList columns={postsColumns}>{postsItems}</ActionList>
    </>
  )
}
