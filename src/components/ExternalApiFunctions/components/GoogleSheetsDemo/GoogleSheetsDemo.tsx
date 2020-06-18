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
  ActionListColumns,
  ActionListItem,
  ActionListItemColumn,
} from "@looker/components"
import { GoogleSheetsDemoProps } from "./types"
import {
  ExtensionContext,
  ExtensionContextData
} from "@looker/extension-sdk-react"
import {
  updateErrorMessage,
  updateSheetData,
} from '../../data/DataReducer'
import { GOOGLE_CLIENT_ID, AuthOption } from '../..'
import { handleResponse, handleError } from '../../utils/validate_data_response'
import { getDataServerFetchProxy } from '../../utils/fetch_proxy'
import {
  POSTS_SERVER_URL,
} from '../..'

/**
 * Demonstrate usage of the google sheets API via the extension sdk fetch proxy
 */
export const GoogleSheetsDemo: React.FC<GoogleSheetsDemoProps> = ({ dataDispatch, dataState }) => {
  // Get access to the extension SDK and the looker API SDK.
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const { extensionSDK } = extensionContext

  // React router setup
  const location = useLocation()

  useEffect(() => {
    // Create a function so that async/await can be used in useEffect
    const fetchData = async () => {
      // Make sure the google client id has been defined
      if (GOOGLE_CLIENT_ID === '') {
        updateErrorMessage(dataDispatch, 'Google client id has not been defined. Please see README.md for instructions.')
      } else {
        const { googleAccessToken, authOption } = location.state as any
        const spreadsheetId = '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'
        const range = 'Class Data!A2:E'
        try {
          if (authOption === AuthOption.Google) {
            // The sheets API can be accessed directly when google is the OAUTH provider.
            if (!googleAccessToken) {
              // This should not happen
              updateErrorMessage(dataDispatch, 'Google access token is missing')
            } else {
              // Read the spread sheet. Note that the spreadsheet id comes from the Google Sheets
              // Browser quick start demo
              // https://developers.google.com/sheets/api/quickstart/js
                const response = await extensionSDK.fetchProxy(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?access_token=${googleAccessToken}`)
                if (handleResponse(response, dataDispatch)) {
                  const values: any[] = response.body?.values || []
                  updateSheetData(dataDispatch, values)
                }
            }
          } else {
            // If use is not logged in using google OAUTH the sheet is read using a 
            // proxy call to the data server. The data server will check to see if the
            // user is authorized to make the call by checking the JWT token.
            const dataServerFetchProxy = getDataServerFetchProxy(extensionSDK, location.state)
            const response = await dataServerFetchProxy.fetchProxy(`${POSTS_SERVER_URL}/sheets/${spreadsheetId}/${range}`)
            if (handleResponse(response, dataDispatch)) {
              const values: any[] = response.body?.values || []
              updateSheetData(dataDispatch, values)
            }
          }
        } catch(error) {
          handleError(error, dispatchEvent)
        }
      }
    }
    // useEffect does not support async/await directly. Fake it with
    // a function
    fetchData()
  }, [])

  const { sheetData } = dataState

  // Sheet column definitions for action list
  const sheetColumns = [
    {
      id: 'name',
      primaryKey: true,
      title: 'Name',
      type: 'string',
      widthPercent: 20,
    },
    {
      id: 'sex',
      title: 'Sex',
      type: 'string',
      widthPercent: 20,
    },
    {
      id: 'collegeYear',
      title: 'Year',
      type: 'string',
      widthPercent: 20,
    },
    {
      id: 'state',
      title: 'State',
      type: 'string',
      widthPercent: 20,
    },
    {
      id: 'major',
      title: 'Major',
      type: 'string',
      widthPercent: 20,
    },
  ] as ActionListColumns

  // render posts action list columns
  const sheetItems = (sheetData || []).map((sheetRow: any[]) => {
    // The column data
    const [ name, sex, collegeYear, state, major ] = sheetRow
    return (
      <ActionListItem key={name} id={name}>
        <ActionListItemColumn>{name}</ActionListItemColumn>
        <ActionListItemColumn>{sex}</ActionListItemColumn>
        <ActionListItemColumn>{collegeYear}</ActionListItemColumn>
        <ActionListItemColumn>{state}</ActionListItemColumn>
        <ActionListItemColumn>{major}</ActionListItemColumn>
      </ActionListItem>
    )
  })

  return(
    <>
      {sheetData && <ActionList columns={sheetColumns}>{sheetItems}</ActionList> }
    </>
  )
}

