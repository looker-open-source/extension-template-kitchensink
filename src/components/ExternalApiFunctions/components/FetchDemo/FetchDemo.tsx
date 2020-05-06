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
import { FetchDemoProps } from "./types"
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
} from '../../data/FetchDemoReducer'

/**
 * Demonstration of Looker extension SDK external API use.
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
export const FetchDemo: React.FC<FetchDemoProps> = ({ fetchDemoDispatch, fetchDemoState }) => {
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  // Get access to the extension SDK and the looker API SDK.
  const { extensionSDK, core40SDK } = extensionContext
  // Component state
  const { posts, name, title, errorMessage, postsServer } = fetchDemoState

  useEffect(() => {
    // Call me to get user name for including in the post
    core40SDK.me()
      .then((result) => {
        if (result.ok) {
          updateName(fetchDemoDispatch, result.value.display_name || "Unknown")
        }
      })
    // Use the extension SDK external API fetch method. A simple GET call.
    // Note the response body is determined from the fetch response. The
    // fetch call can take a third argument that indicates what type of
    // response is expected.
    extensionSDK.fetch(`${postsServer}/posts`)
      .then((response: any) => {
        if (response.ok) {
          updatePosts(fetchDemoDispatch, response.body.reverse())
          updateErrorMessage(fetchDemoDispatch, undefined)
        } else {
          updateErrorMessage(fetchDemoDispatch, "Has the data server been started? yarn start start-data-server")
        }
      }).catch((error: any) => {
        if (typeof error === 'string' && error.startsWith("Required Looker version ")) {
          updateErrorMessage(fetchDemoDispatch, "This version of Looker does not support external API functions")
        } else if (typeof error === 'string' && error.startsWith("Entitlements must be defined")) {
          updateErrorMessage(fetchDemoDispatch, "Entitlements must be defined to use external API functionality")
        } else {
          updateErrorMessage(fetchDemoDispatch, "Has the data server been started? yarn start start-data-server")
        }
      })
  }, [postsServer])

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

  const onPostDelete = (post: any) => {
    // Slightly more complex use of the fetch method. In this case
    // the DELETE method is used.
    extensionSDK.fetch(
      `${postsServer}/posts/${post.id}`,
      {
        method: 'DELETE',
      }).then((response: any) => {
        if (response.ok) {
          updateTitle(fetchDemoDispatch, "")
          updateErrorMessage(fetchDemoDispatch, undefined)
        } else {
          console.error("Failed to delete post", response)
          updateErrorMessage(fetchDemoDispatch, "Failed to delete post")
          return undefined
        }
        // Standard Promise chaining. Use the fetch method to get the
        // posts data again as a post was just deleted.
        return extensionSDK.fetch(`${postsServer}/posts`)
      }).then((response: any) => {
        if (response) {
          if (response.ok) {
            updatePosts(fetchDemoDispatch, response.body.reverse())
            updateErrorMessage(fetchDemoDispatch, undefined)
          } else {
            console.error("Failed to get posts", response)
            updateErrorMessage(fetchDemoDispatch, "Failed to get post")
          }
        }
      }).catch((error: any) => {
        console.error("An unexpected error occured:", error)
        updateErrorMessage(fetchDemoDispatch, `An unexpected error occured: ${error}`)
      })
  }

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

  const onDismiss = () => {
    updateErrorMessage(fetchDemoDispatch, undefined)
  }

  const onTitleChange = (e: any) => {
    updateTitle(fetchDemoDispatch, e.currentTarget.value)
  }

  const onCreatePostSubmit = (event: React.FormEvent) => {
    // Need to prevent default processing for event from occurring.
    // The button is rendered in a form and default action is to
    // submit the form.
    event.preventDefault()
    // A more complex use of the fetch API. In this case the
    // content type must be included in the headers as the json server
    // will not process it otherwise.
    // Note the that JSON object in the string MUST be converted to
    // a string.
    extensionSDK.fetch(
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
      }).then((response: any) => {
        if (response.ok) {
          updateTitle(fetchDemoDispatch, "")
          updateErrorMessage(fetchDemoDispatch, undefined)
        } else {
          console.error("Failed to create post", response)
          updateErrorMessage(fetchDemoDispatch, "Failed to create post")
          return undefined
        }
        // Once again, simple fetch call to get the posts as a new post
        // has just been added. The method defaults to GET.
        return extensionSDK.fetch(`${postsServer}/posts`)
      }).then((response: any) => {
        if (response) {
          if (response.ok) {
            updatePosts(fetchDemoDispatch, response.body.reverse())
            updateErrorMessage(fetchDemoDispatch, undefined)
          } else {
            console.error("Failed to get posts", response)
            updateErrorMessage(fetchDemoDispatch, "Failed to get post")
          }
        }
      }).catch((error: any) => {
        console.error("An unexpected error occured", error)
        updateErrorMessage(fetchDemoDispatch, `An unexpected error occured: ${error}`)
      })
  }

  const onChangeServerClick = (value: string) => {
    // Allow server to be changed to facilitate integration tests.
    // Integration do not have access to 127.0.0.1 so server can be
    // changed during the test.
    try {
      new URL(value)
      updatePostsServer(fetchDemoDispatch, value.endsWith('/') ? value.substring(0, value.length - 1) : value)
    }
    catch(error) {
      updateErrorMessage(fetchDemoDispatch, 'Invalid URL')
    }
  }

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
