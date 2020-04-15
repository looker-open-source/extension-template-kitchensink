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

import { Box, MenuGroup, MenuItem, MenuItemProps } from "@looker/components"
import * as React from "react"
import { Link as RouterLink, LinkProps } from "react-router-dom"
import styled from "styled-components"
import { SidebarProps } from "./"
import omit from "lodash/omit"
import { ROUTES } from '../../App'

export const Sidebar: React.FC<SidebarProps> = ({ route }) => {
  return (
    <Box display="flex" flexDirection="column">
      <MenuGroup type="none" mt="xsmall">
        <StyledRouterLink to={ROUTES.API_ROUTE}>
          <MenuItem icon="Flag" current={route === ROUTES.API_ROUTE}>
            Api Functions
          </MenuItem>
        </StyledRouterLink>
        <StyledRouterLink to={ROUTES.CORESDK_ROUTE}>
          <MenuItem icon="Clock" current={route.startsWith(ROUTES.CORESDK_ROUTE)}>
            Core SDK Functions
          </MenuItem>
        </StyledRouterLink>
        <StyledRouterLink to={ROUTES.EMBED_DASHBOARD}>
          <MenuItem icon="ApplicationSelect" current={route === ROUTES.EMBED_DASHBOARD}>
            Embed Dashboard
          </MenuItem>
        </StyledRouterLink>
        <StyledRouterLink to={ROUTES.EMBED_EXPLORE}>
          <MenuItem icon="ApplicationSelect" current={route === ROUTES.EMBED_EXPLORE}>
            Embed Explore
          </MenuItem>
        </StyledRouterLink>
        <StyledRouterLink to={ROUTES.EMBED_LOOK}>
          <MenuItem icon="ApplicationSelect" current={route === ROUTES.EMBED_LOOK}>
            Embed Look
          </MenuItem>
        </StyledRouterLink>
      </MenuGroup>
    </Box>
  )
}

const StyledRouterLinkInner: React.FC<LinkProps & MenuItemProps> = props => (
  <RouterLink {...omit(props, "customizationProps")} />
)

const StyledRouterLink = styled(StyledRouterLinkInner)`
  text-decoration: none;
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`
