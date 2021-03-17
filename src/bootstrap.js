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


import { request } from './client';

const parseAndReject = response => response.json().then( err => Promise.reject(err) );

const bootstrap = async function bootstrap({
  clientId,
  baseUrl,
  scopes = ['openid', 'email'],
  redirectUri,
  codeChallenge,
  codeChallengeMethod,
  state,
}) {

  const target = `${baseUrl}/v1/interact`;
  const body = Object.entries({
    client_id: clientId,
    scope: scopes.join(' '),
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    state,
  })
    .map( ([param, value]) => `${param}=${encodeURIComponent(value)}` )
    .join('&');
  const headers = {
    'content-type': 'application/x-www-form-urlencoded',
  };

  return request(target, { headers, body })
    .then( response => response.ok ? response.json() : parseAndReject( response ) )
    .then( data => data.interaction_handle);
};

export default bootstrap;
