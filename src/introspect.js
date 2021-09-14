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

const introspect = async function introspect({ domain, interactionHandle, stateHandle, version, headers, extraPayload }) {
  const target = `${domain}/idp/idx/introspect`;
  const body = stateHandle ? { stateToken: stateHandle, extraPayload } : { interactionHandle, extraPayload };
  headers = headers || {};
  headers['ted-test-header'] = 'wow/works!';
  headers['content-type'] = `application/ion+json; okta-version=${version}`; // Server wants this version info
  headers['accept'] = `application/ion+json; okta-version=${version}`;

  return request(target, { headers, body: JSON.stringify(body) })
    .then( response => response.ok ? response.json() : parseAndReject( response ) );
};

export default introspect;
