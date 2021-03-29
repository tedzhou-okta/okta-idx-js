import { HttpClient, request } from '../../src/client';

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery

const mockInteractResponse = require('../mocks/interact-response');
const { Response } = jest.requireActual('cross-fetch');

describe('request', () => {
  it('does not process interceptors when none are configured', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockInteractResponse )) ) );

    return request('https://example.com', { body: 'foo=bar' })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'https://example.com' );
        expect( fetch.mock.calls[0][1] ).toEqual( {
          body: 'foo=bar',
          headers: {
            'X-Okta-User-Agent-Extended': `okta-idx-js/${SDK_VERSION}`,
          },
          method: 'POST',
        });
      });
  });

  it('allows consumers of the library change configuration values through interceptors', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockInteractResponse )) ) );

    const interceptor = (config) => {
      // Rewrite config by reference
      config.url = 'https://okta.com';
      config.headers = { 'foo': 'bar' };
      config.method = 'GET';
      config.body = 'body value';
    };

    HttpClient.interceptors.request.use(interceptor);

    return request('https://example.com', { /* use lib defaults */ })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'https://okta.com' );
        expect( fetch.mock.calls[0][1] ).toEqual( {
          body: 'body value',
          headers: {
            'foo': 'bar',
          },
          method: 'GET'
        });
      });
  });

  it('allows consumers of the library add and remove interceptors', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockInteractResponse )) ) );

    const interceptor = (config) => {
      // Rewrite config by reference
      config.url = 'changed';
    };

    HttpClient.interceptors.request.use(interceptor);

    await request('https://example.com', { /* use lib defaults */ })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'changed' );
      });

    // Clear all attached interceptors
    HttpClient.interceptors.request.clear();

    await request('https://example.com', { /* use lib defaults */ })
      .then( () => {
        expect( fetch.mock.calls.length ).toBe(2);
        expect( fetch.mock.calls[1][0] ).toEqual( 'https://example.com' );
      });
  });
});
