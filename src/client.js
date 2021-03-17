/*!
 * Copyright (c) 2021-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */


import fetch from 'cross-fetch';
import { userAgentHeaders } from './userAgent';

/**
 * Reusable interceptor interface
 */
function Interceptor() {
  this.handlers = [];

  // Adds a new interceptor to our HttpClient
  this.use = function(before) {
    this.handlers.push({
      before,
    });
  };

  // Clears all interceptors
  this.clear = function() {
    this.handlers = [];
  };
}

/**
 * Singleton instance of the IdX HTTP Client
 *
 * Invoke the `use` method to add a new interceptor:
 *   - client.interceptors.request.use((requestConfig) => { some logic });
 */
const HttpClient = {
  interceptors: {
    request: new Interceptor(),
  },
};

const request = async function request( target, { method = 'POST', headers = {}, body } ) {
  const requestOptions = {
    url: target,
    method,
    headers: {
      ...userAgentHeaders(),
      ...headers,
    },
    body,
  };

  if (HttpClient.interceptors) {
    HttpClient.interceptors.request.handlers.forEach( interceptor => {
      interceptor.before(requestOptions);
    });
  }

  // Extract the URL to adhere to the fetch API
  const { url } = requestOptions;
  delete requestOptions.url;

  return fetch( url, requestOptions );
};

export {
  HttpClient,
  request,
};
