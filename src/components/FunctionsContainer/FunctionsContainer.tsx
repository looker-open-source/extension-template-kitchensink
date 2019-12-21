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

import React from "react"
import { Heading, Box } from "@looker/components"
import styled from "styled-components"
import { ExtensionButton } from "../ExtensionButton"
import { FunctionsContainerProps } from "./types"

export const FunctionsContainer: React.FC<FunctionsContainerProps> = ({title, children, messages, clearMessages}) => {

  return (
    <>
      <Heading my="xlarge">{title}</Heading>
      <Box display="flex" flexDirection="row" width="100%">
        <Box display="flex" flexDirection="column" width="50%">
          {children}
          <ExtensionButton
            mt="small"
            variant="outline"
            onClick={clearMessages}
          >
            Clear messages
          </ExtensionButton>
        </Box>
        <Box width="50%" pr="large">
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
  max-width: 40vw;
`
