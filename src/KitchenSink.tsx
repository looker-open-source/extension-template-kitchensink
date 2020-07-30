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

import React, { useState, useContext } from 'react'
import { Switch, Route } from 'react-router-dom'
import styled from 'styled-components'
import { Box, ComponentsProvider, MessageBar } from '@looker/components'
import {
  ExtensionContext,
  ExtensionContextData,
} from '@looker/extension-sdk-react'
import { Sidebar } from './components/Sidebar'
import { CoreSDKFunctions } from './components/CoreSDKFunctions'
import { ApiFunctions } from './components/ApiFunctions'
import { Home } from './components/Home'
import { EmbedDashboard } from './components/Embed'
import { EmbedExplore } from './components/Embed/EmbedExplore'
import { EmbedLook } from './components/Embed/EmbedLook'
import { ExternalApiFunctions } from './components/ExternalApiFunctions'
import { MiscFunctions } from './components/MiscFunctions'
import { Configure } from './components/Configure'
import { KitchenSinkProps, ConfigurationData } from './types'

export enum ROUTES {
  HOME_ROUTE = '/',
  API_ROUTE = '/api',
  CORESDK_ROUTE = '/coresdk',
  EMBED_DASHBOARD = '/embed/dashboard',
  EMBED_EXPLORE = '/embed/explore',
  EMBED_LOOK = '/embed/look',
  EXTERNAL_API_ROUTE = '/externalapi',
  MISC_ROUTE = '/misc',
  CONFIG_ROUTE = '/config',
}

export const KitchenSink: React.FC<KitchenSinkProps> = ({
  route,
  routeState,
}) => {
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const { extensionSDK, initializeError } = extensionContext
  const [configurationData, setConfigurationData] = useState<ConfigurationData>(
    extensionSDK.getContextData() || {
      showApiFunctions: true,
      showCoreSdkFunctions: true,
      showEmbedDashboard: true,
      showEmbedExplore: true,
      showEmbedLook: true,
      showExternalApiFunctions: true,
      showMiscFunctions: true,
      dashboardId: 1,
      exploreId: 'thelook/products',
      lookId: 1,
    }
  )

  const updateConfigurationData = async (
    configurationData: ConfigurationData
  ): Promise<boolean> => {
    setConfigurationData(configurationData)
    try {
      await extensionSDK.saveContextData(configurationData)
      return true
    } catch (error) {
      return false
    }
  }

  return (
    <ComponentsProvider>
      {initializeError ? (
        <MessageBar intent="critical">{initializeError}</MessageBar>
      ) : (
        <Layout>
          <Sidebar
            route={route}
            routeState={routeState}
            configurationData={configurationData}
          />
          <Box>
            <Switch>
              {configurationData.showApiFunctions && (
                <Route path={ROUTES.API_ROUTE}>
                  <ApiFunctions />
                </Route>
              )}
              {configurationData.showCoreSdkFunctions && (
                <Route
                  path={[
                    ROUTES.CORESDK_ROUTE,
                    `${ROUTES.CORESDK_ROUTE}?test=abcd`,
                  ]}
                >
                  <CoreSDKFunctions />
                </Route>
              )}
              {configurationData.showEmbedDashboard && (
                <Route path={ROUTES.EMBED_DASHBOARD}>
                  <EmbedDashboard id={configurationData.dashboardId} />
                </Route>
              )}
              {configurationData.showEmbedExplore && (
                <Route path={ROUTES.EMBED_EXPLORE}>
                  <EmbedExplore id={configurationData.exploreId} />
                </Route>
              )}
              {configurationData.showEmbedLook && (
                <Route path={ROUTES.EMBED_LOOK}>
                  <EmbedLook id={configurationData.lookId} />
                </Route>
              )}
              {configurationData.showExternalApiFunctions && (
                <Route path={ROUTES.EXTERNAL_API_ROUTE}>
                  <ExternalApiFunctions />
                </Route>
              )}
              {configurationData.showMiscFunctions && (
                <Route path={ROUTES.MISC_ROUTE}>
                  <MiscFunctions />
                </Route>
              )}
              <Route path={ROUTES.CONFIG_ROUTE}>
                <Configure
                  configurationData={configurationData}
                  updateConfigurationData={updateConfigurationData}
                />
              </Route>
              <Route>
                <Home />
              </Route>
            </Switch>
          </Box>
        </Layout>
      )}
    </ComponentsProvider>
  )
}

export const Layout = styled(Box)`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: 200px auto;
  width: 100vw;
`
