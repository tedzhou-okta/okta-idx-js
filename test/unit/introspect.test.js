import introspect from '../../src/introspect';

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery

const mockIdxResponse = require('../mocks/request-identifier');
const mockErrorResponse = require('../mocks/error-response');
const { Response } = jest.requireActual('cross-fetch');

fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );

describe('introspect', () => {
  it('returns an idxResponse on success', async () => {
    return introspect({ domain: 'http://okta.example.com', stateHandle: 'FAKEY-FAKE' })
      .then( result => {
        expect(result).toEqual(mockIdxResponse);
      });
  });

  it('rejects if the idxResponse is an error', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockErrorResponse ), { status: 500 }) ) );
    return introspect({ domain: 'http://okta.example.com', stateHandle: 'FAKEY-FAKE' })
      .then( () => {
        fail('expected introspect to reject when not given a domain');
      })
      .catch( err => {
        expect(err).toEqual({
          errorCode: 'E0000068',
          errorSummary: 'Invalid Token',
          errorLink: 'E0000068',
          errorId: 'oaeEtqUk5zeRVSlSM-jiw7GFA',
          errorCauses: [ { errorSummary: 'Authentication failed' } ]
        });
      });
  });
});
