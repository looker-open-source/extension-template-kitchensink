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
  Banner,
  Box,
  Button,
  ButtonOutline,
  FieldText,
  Form,
  Prompt,
  Text,
} from "@looker/components"
import { FetchProxyDemoProps } from "./types"
import {
  ExtensionContext,
  ExtensionContextData
} from "@looker/extension-sdk-react"
import {
  updateName,
  updatePosts,
  updateTitle,
  updateErrorMessage,
  updatePostsServer,
} from '../../data/DataReducer'
import { extractMessageFromError } from '../../../../utils'

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
export const FetchProxyDemo: React.FC<FetchProxyDemoProps> = ({ dataDispatch, dataState }) => {
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  // Get access to the extension SDK and the looker API SDK.
  const { extensionSDK, core40SDK } = extensionContext
  // Component state
  const { posts, name, title, errorMessage, postsServer } = dataState

  useEffect(() => {
    const fetchData = async () => {
      try {
      // Call me to get user name for including in the post
      const value = await core40SDK.ok(core40SDK.me())
        updateName(dataDispatch, value.display_name || "Unknown")
      } catch(error) {
        updateName(dataDispatch, "Unknown")
      }
      fetchPosts(true)
    }
    fetchData()
  }, [postsServer])

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
      let response = await extensionSDK.fetchProxy(
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
      if (response.ok) {
        updateTitle(dataDispatch, "")
        updateErrorMessage(dataDispatch, undefined)
        fetchPosts()
      } else {
        console.error("Failed to create post", response)
        updateErrorMessage(dataDispatch, "Failed to create post")
      }
    } catch(error) {
      console.error("An unexpected error occured", error)
      updateErrorMessage(dataDispatch, `An unexpected error occured: ${extractMessageFromError(error)}`)
    }
  }

  const onPostDelete = async (post: any) => {
    // Slightly more complex use of the fetch method. In this case
    // the DELETE method is used.
    try {
      let response: any = await extensionSDK.fetchProxy(
        `${postsServer}/posts/${post.id}`,
        {
          method: 'DELETE',
        })
      if (response.ok) {
        updateTitle(dataDispatch, "")
        updateErrorMessage(dataDispatch, undefined)
        fetchPosts()
      } else {
        console.error("Failed to delete post", response)
        updateErrorMessage(dataDispatch, "Failed to delete post")
      }
    }
    catch(error) {
      console.error("An unexpected error occured:", error)
      updateErrorMessage(dataDispatch, `An unexpected error occured: ${extractMessageFromError(error)}`)
    }
  }

  const fetchPosts = async(firstTime = false) => {
    try {
      // Use the extension SDK external API fetch method. A simple GET call.
      // Note the response body is determined from the fetch response. The
      // fetch call can take a third argument that indicates what type of
      // response is expected.
      const response = await extensionSDK.fetchProxy(`${postsServer}/posts`)
      if (response.ok) {
        updatePosts(dataDispatch, response.body.reverse())
        updateErrorMessage(dataDispatch, undefined)
      } else {
        updateErrorMessage(dataDispatch, "Has the data server been started? yarn start start-data-server")
      }
    } catch(error) {
      const errorMessage = extractMessageFromError(error)
      if (firstTime && errorMessage.startsWith("Required Looker version ")) {
        updateErrorMessage(dataDispatch, "This version of Looker does not support external API functions")
      } else if (firstTime && errorMessage.startsWith("Entitlements must be defined")) {
        updateErrorMessage(dataDispatch, "Entitlements must be defined to use external API functionality")
      } else if (firstTime) {
        updateErrorMessage(dataDispatch, "Has the data server been started? yarn start start-data-server")
      } else {
        updateErrorMessage(dataDispatch, `An unexpected error occured: ${errorMessage}`)
      }
    }
  }

  const onTitleChange = (e: any) => {
    updateTitle(dataDispatch, e.currentTarget.value)
  }

  const onDismiss = () => {
    updateErrorMessage(dataDispatch, undefined)
  }

  const onChangeServerClick = (value: string) => {
    // Allow server to be changed to facilitate integration tests.
    // Integration do not have access to 127.0.0.1 so server can be
    // changed during the test.
    try {
      new URL(value)
      updatePostsServer(dataDispatch, value.endsWith('/') ? value.substring(0, value.length - 1) : value)
    }
    catch(error) {
      updateErrorMessage(dataDispatch, 'Invalid URL')
    }
  }

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

  const postsItems = posts.map((post: any) => {
    const actions = (
      <>
        <ActionListItemAction onClick={onPostDelete.bind(null, post)}>
          Delete
        </ActionListItemAction>
      </>
    )

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
      {errorMessage &&
        <Banner intent="error" onDismiss={onDismiss} canDismiss>
          {errorMessage}
        </Banner>
      }
      <Box display="flex" flexDirection="row" justifyContent="space-between" mb="medium" alignItems="baseline">
        <Text>Posts data is being served from {postsServer}</Text>
        <Prompt
          title="Change server"
          inputLabel='Server'
          defaultValue={postsServer}
          onSave={onChangeServerClick}
        >
          {(open) => <ButtonOutline onClick={open}>Change server</ButtonOutline>}
        </Prompt>
      </Box>
      <Box mb="medium" px="xlarge" pt="small" border="1px solid" borderColor="palette.charcoal200" borderRadius="4px">
        <Form onSubmit={onCreatePostSubmit}>
          <FieldText label="Title" name="title" value={title} onChange={onTitleChange} required />
          <FieldText label="Author" name="author" value={name} readOnly />
          <Button disabled={title.length === 0}>Create Post</Button>
        </Form>
      </Box>
      <ActionList columns={postsColumns}>{postsItems}</ActionList>
    </>
  )
}
