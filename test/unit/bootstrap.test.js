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


import bootstrap from '../../src/bootstrap';
import { HttpClient } from '../../src/client';

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery

const mockInteractResponse = require('../mocks/interact-response');
const { Response } = jest.requireActual('cross-fetch');

const mockConfig = {
  baseUrl: 'http://okta.example.com',
  clientId: 'CLIENT_ID',
  redirectUri: 'redirect://',
  codeChallenge: 'foo',
  codeChallengeMethod: 'method',
};

describe('bootstrap', () => {
  afterEach(() => {
    HttpClient.interceptors.request.clear();
  });

  it('fetches an interaction handle', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockInteractResponse )) ) );
    return bootstrap({ ...mockConfig, scope: 'openid email' })
      .then( result => {
        expect(result).toEqual('ZZZZZZZINTERACTZZZZZZZZ');
      });
  });

  it('allows consumers of the library to pass in custom headers', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockInteractResponse )) ) );

    HttpClient.interceptors.request.use( (config) => {
      // Rewrite headers
      config.headers['X-Test-Header'] = 'foo';
      config.headers['X-Okta-User-Agent-Extended'] = 'my-sdk-value';
    });

    return bootstrap({ ...mockConfig })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'http://okta.example.com/v1/interact' );
        expect( fetch.mock.calls[0][1] ).toEqual( {
          body: 'client_id=CLIENT_ID&scope=openid%20email&redirect_uri=redirect%3A%2F%2F&code_challenge=foo&code_challenge_method=method&state=undefined',
          credentials: 'include',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-Test-Header': 'foo',
            'X-Okta-User-Agent-Extended': 'my-sdk-value',
          },
          method: 'POST'
        });
      });
  });
});

