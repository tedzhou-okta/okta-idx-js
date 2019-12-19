import { introspect } from '../../src/introspect';

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery

const mockIdxResponse = require('../mocks/request-identifier');
const { Response } = jest.requireActual('cross-fetch');

fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );

describe('introspect', () => {
  it('returns an idxResponse on success', async () => {
    return introspect({ domain: 'http://okta.example.com', stateHandle: 'FAKEY-FAKE' })
      .then( result => {
        expect(result).toMatchObject(mockIdxResponse);
      });
  });

  it('rejects without a stateHandle', async () => {
    return introspect({ domain: 'http://okta.example.com' })
      .then( () => {
        fail('expected introspect to reject when not given a stateHandle');
      })
      .catch( err => {
        expect(err).toMatchObject({ error: 'stateHandle is required'});
      });
  });

  it('rejects without a domain', async () => {
    return introspect({ stateHandle: 'FAKEY-FAKE' })
      .then( () => {
        fail('expected introspect to reject when not given a domain');
      })
      .catch( err => {
        expect(err).toMatchObject({ error: 'domain is required'});
      });
  });

  it('rejects if the idxResponse is an error', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse ), { status: 500 }) ) );
    return introspect({ domain: 'http://okta.example.com', stateHandle: 'FAKEY-FAKE' })
      .then( () => {
        fail('expected introspect to reject when not given a domain');
      })
      .catch( err => {
        expect(err.constructor.name).toBe('Response');
      });
  });
});
