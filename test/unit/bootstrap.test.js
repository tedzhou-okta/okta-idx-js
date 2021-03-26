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
      .then( result => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'http://okta.example.com/v1/interact' );
        expect( fetch.mock.calls[0][1] ).toEqual( {
          body: 'client_id=CLIENT_ID&scope=openid%20email&redirect_uri=redirect%3A%2F%2F&code_challenge=foo&code_challenge_method=method&state=undefined',
          headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-Test-Header': 'foo',
            'X-Okta-User-Agent-Extended': 'my-sdk-value',
          },
          method: "POST"
        });
      });
  });
});

