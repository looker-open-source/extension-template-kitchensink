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
import {
  ActionList,
  ActionListItemAction,
  ActionListColumns,
  ActionListItem,
  ActionListItemColumn,
  Box,
  Button,
  ButtonOutline,
  FieldText,
  Form,
  Prompt,
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
  updateErrorMessage,
  updatePostsServer,
} from '../../data/DataReducer'
import { handleResponse, handleError } from '../../utils/validate_data_response'
import { getDataServerFetchProxy } from '../../utils/fetch_proxy'

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
  const dataServerFetchProxy  = getDataServerFetchProxy(extensionSDK)

  // Get state from redux
  const { posts, name, title, postsServer } = dataState

  // Get data when ever the posts server URL changes. This happens on
  // component initialiization ase well.
  useEffect(() => {
    // Create a function so that async/await can be used in useEffect
    const fetchData = async () => {
      // Ensure users session is still valid. If it's not this component
      // will log the user in anonymously.
      await authCheck()

      // Get the posts.
      fetchPosts(true)
    }
    // useEffect does not support async/await directly. Fake it with
    // a function
    fetchData()
  }, [postsServer])

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
      let response = await dataServerFetchProxy.fetchProxy(
        `${postsServer}/posts`,
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
      let response = await dataServerFetchProxy.fetchProxy(
        `${postsServer}/posts/${post.id}`,
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

  // Check to see if the user session is still valid.
  const authCheck = async () => {
    try {
      // Got a valid session?
      let response = await dataServerFetchProxy.fetchProxy(`${postsServer}/auth`)
      if (response.status === 401) {
        // No, login anonymously
        // TODO update auth option in state?
        response = await dataServerFetchProxy.fetchProxy(
          `${postsServer}/auth`,
          {
            method: 'POST',
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              type : 'none',
            })
          })
      }
    } catch(error) {
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
      const response = await dataServerFetchProxy.fetchProxy(`${postsServer}/posts`)
      if (handleResponse(response, dataDispatch)) {
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

  // Handle data server URL change
  const onChangeServerClick = (value: string) => {
    // Allow server to be changed to facilitate integration tests.
    // Integration do not have access to 127.0.0.1 so server can be
    // changed during the test.
    try {
      new URL(value)
      updatePosts(dataDispatch, [])
      updatePostsServer(dataDispatch, value.endsWith('/') ? value.substring(0, value.length - 1) : value)
    }
    catch(error) {
      updateErrorMessage(dataDispatch, 'Invalid URL')
    }
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
        <Text>Posts data is being served from {postsServer}</Text>
        <Box display="flex" flexDirection="row" alignItems="baseline">
          <Prompt
            title="Change server"
            inputLabel='Server'
            defaultValue={postsServer}
            onSave={onChangeServerClick}
          >
            {(open) => <ButtonOutline onClick={open}>Change server</ButtonOutline>}
          </Prompt>
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
