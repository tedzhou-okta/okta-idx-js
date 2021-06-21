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


import idx from '../../src/index';
//  We must import before webpack to be able to mock
//  Integration tests will run against webpacked code

// Note: All network interactions should be mocked
// All stateHandles and similar are fake
// See the integration tests for the full back-and-forth

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery
const mockRequestIdentity = require('../mocks/request-identifier');
const mockErrorResponse = require('../mocks/error-response');
const mockAuthenticatorErrorResponse = require('../mocks/error-authenticator-enroll');
const { Response } = jest.requireActual('cross-fetch');

fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockRequestIdentity )) ) );

const stateHandle = 'FAKE_STATE_HANDLE';
const domain = 'http://okta.example.com';
const orgIssuer = 'http://okta.example.com';
const customIssuer = 'http://okta.example.com/oauth2/default';
const version = '1.0.0';
const clientId = 'CLIENT_ID';
const redirectUri = 'https://example.com/fake';
const codeChallenge = 'BASE64URLENCODED';
const codeChallengeMethod = 'S256';

describe('idx-js', () => {
  describe('start', () => {

    it('requires a clientId when there is no stateHandle', async () => {
      return idx.start({ domain, version, redirectUri })
        .then( () => {
          fail('expected idx.start to reject without one of: clientId, stateHandle');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'clientId is required' });
        });
    });

    it('requires a redirectUri when there is no stateHandle', async () => {
      return idx.start({ domain, clientId, version })
        .then( () => {
          fail('expected idx.start to reject without one of: redirectUri, stateHandle');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'redirectUri is required' });
        });
    });

    it('requires PKCE attributes when there is no stateHandle', async () => {
      return idx.start({ domain, clientId, version, redirectUri })
        .then( () => {
          fail('expected idx.start to reject without PKCE params if no stateHandle');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'PKCE params (codeChallenge, codeChallengeMethod) are required' });
        });
    });

    it('handles updating the baseUrl for an org authorization server issuer', async () => {
      return idx.start({ issuer: `${orgIssuer}`, clientId, version, redirectUri, codeChallenge, codeChallengeMethod })
        .then( idxState => {
          expect(idxState.toPersist.baseUrl).toEqual('http://okta.example.com/oauth2');
        });
    });

    it('accepts the baseUrl from a custom authorization server issuer', async () => {
      return idx.start({ issuer: `${customIssuer}`, clientId, version, redirectUri, codeChallenge, codeChallengeMethod })
        .then( idxState => {
          expect(idxState.toPersist.baseUrl).toEqual('http://okta.example.com/oauth2/default');
        });
    });

    it('handles an org AS issuer with a trailing slash', async () => {
      return idx.start({ issuer: `${orgIssuer}/`, clientId, version, redirectUri, codeChallenge, codeChallengeMethod })
        .then( idxState => {
          expect(idxState.toPersist.baseUrl).toEqual('http://okta.example.com/oauth2');
        });
    });

    it('handles a custom AS issuer with a trailing slash', async () => {
      return idx.start({ issuer: `${customIssuer}/`, clientId, version, redirectUri, codeChallenge, codeChallengeMethod })
        .then( idxState => {
          expect(idxState.toPersist.baseUrl).toEqual('http://okta.example.com/oauth2/default');
        });
    });

    it('rejects if there is no domain or issuer', async () => {
      return idx.start({ stateHandle, version })
        .then( () => {
          fail('expected idx.start to reject when not given a domain');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'issuer is required'});
        });
    });

    it('rejects without a version', async () => {
      return idx.start({ stateHandle, domain })
        .then( () => {
          fail('expected idx.start to reject when not given a version');
        })
        .catch( err => {
          expect(fetch).not.toHaveBeenCalled();
          expect(err).toStrictEqual({ error: 'version is required'});
        });
    });

    it('does not call introspect with a well formed but bad version', async () => {
      return idx.start({ stateHandle, domain, version: '999999.9999.9999' })
        .then( () => {
          fail('expected idx.start to reject when not given a wrong version');
        })
        .catch( err => {
          expect( err ).toEqual( { error: new Error('Unknown api version: 999999.9999.9999.  Use an exact semver version.') });
          expect( fetch ).not.toHaveBeenCalled();
        });
    });

    it('returns an idxState when a generic error occurs during introspect', async () => {
      fetch.mockImplementationOnce( () => Promise.resolve( new Response(JSON.stringify( mockErrorResponse ), { status: 500 }) ) );

      return idx.start({ domain, stateHandle, version })
        .then( () => {
          fail('expected idx.start to reject when not given a wrong version');
        })
        .catch( ( { error } ) => {
          expect(error.details).toBeDefined();
          expect(error.details.context).toBeDefined();
          expect(typeof error.details.proceed).toBe('function');
          expect(error.details.neededToProceed).toEqual([]);
          expect(error.details.rawIdxState).toStrictEqual(mockErrorResponse);
          expect(error.error).toEqual('introspect call failed');
        });
    });

    it('returns an idxState when an authenticator error occurs during introspect', async () => {
      fetch.mockImplementationOnce( () => Promise.resolve(
        new Response(JSON.stringify( mockAuthenticatorErrorResponse ), { status: 403 }) ),
      );

      return idx.start({ domain, stateHandle, version })
        .then( () => {
          fail('expected idx.start to reject when not given a wrong version');
        })
        .catch( ( { error } ) => {
          expect(error.details).toBeDefined();
          expect(error.details.context).toBeDefined();
          expect(typeof error.details.proceed).toBe('function');
          expect(error.details.neededToProceed).toHaveLength(1);
          expect(error.details.rawIdxState).toBeDefined();
          expect(error.error).toEqual('introspect call failed');
        });
    });

    it('returns an idxState', async () => {
      return idx.start({ domain, stateHandle, version })
        .then( idxState => {
          expect(idxState).toBeDefined();
          expect(idxState.context).toBeDefined();
          expect(typeof idxState.proceed).toBe('function');
          expect(typeof idxState.actions.cancel).toBe('function');
          expect(idxState.rawIdxState).toStrictEqual(mockRequestIdentity);
        });
    });

  });
});
