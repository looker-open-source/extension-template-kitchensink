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

import React, { useEffect, useReducer } from "react"
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import { Box, Divider, Heading, TabList, Tab, TabPanels, TabPanel, Text } from "@looker/components"
import { SandboxStatus } from "../SandboxStatus"
import { ExternalApiFunctionsProps } from "./types"
import { FetchDemo } from './components/FetchDemo'
import { initialState as fetchDemoInitialState, reducer as fetchDemoReducer } from './data/FetchDemoReducer'

export const ExternalApiFunctions: React.FC<ExternalApiFunctionsProps> = () => {
  // State is stored here as asynchronous actions may complete
  // after components unload. If components own state, react puts messages
  // on the console.
  const [ fetchDemoState, fetchDemoDispatch ] = useReducer(fetchDemoReducer, fetchDemoInitialState)

  const history = useHistory()
  const location = useLocation()
  const match = useRouteMatch<{ extension: string, tab: string }>('/:extension/:tab')
  useEffect(() => {
    if (!match) {
      history.push(`${location.pathname}/0`)
    }
  }, [])
  let selectedIndex = match ? Number(match.params.tab) : 0
  selectedIndex = isNaN(selectedIndex) ? -1 : selectedIndex
  const onSelectTab = (index: number) => {
    if (match) {
      history.push(`/${match.params.extension}/${index}`)
    }
  }

  return (
    <>
      <Heading mt="xlarge">External API Functions</Heading>
      <SandboxStatus/>
      <Box padding="small">
        <Divider/>
        <TabList selectedIndex={selectedIndex} onSelectTab={onSelectTab}>
          <Tab>Fetch Demo</Tab>
          <Tab>Coming Soon!</Tab>
        </TabList>
        <TabPanels selectedIndex={selectedIndex}>
         <TabPanel>
           <FetchDemo fetchDemoDispatch={fetchDemoDispatch} fetchDemoState={fetchDemoState} />
         </TabPanel>
         <TabPanel>
           <Text>More demos coming soon</Text>
         </TabPanel>
       </TabPanels>
     </Box>
    </>
  )
}
