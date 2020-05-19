import { ExtensionSDK, FetchProxy } from "@looker/extension-sdk";

let dataServerFetchProxy: FetchProxy

/**
 * The data server factory uses cookies. Credentials must be set to include in order
 * for third party cookies to be sent to the server
 * @param extensionSDK
 */
export const getDataServerFetchProxy = (extensionSDK: ExtensionSDK): FetchProxy => {
  if (!dataServerFetchProxy) {
    dataServerFetchProxy = extensionSDK.createFetchProxy(undefined, { credentials: 'include' })
  }
  return dataServerFetchProxy
}