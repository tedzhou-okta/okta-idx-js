import introspect from '../../src/introspect';

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery

const mockIdxResponse = require('../mocks/request-identifier');
const mockErrorResponse = require('../mocks/error-response');
const { Response } = jest.requireActual('cross-fetch');

let domain = 'http://okta.example.com';
let stateHandle = 'FAKEY-FAKE';
let version = '1.0.0';

describe('introspect', () => {
  it('returns an idxResponse on success', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );
    return introspect({ domain, stateHandle, version })
      .then( result => {
        expect(result).toEqual(mockIdxResponse);
      });
  });

  it('rejects if the idxResponse is an error', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockErrorResponse ), { status: 500 }) ) );
    return introspect({ domain, stateHandle, version })
      .then( () => {
        fail('expected introspect to reject when fetch call returns an HTTP error code');
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

  it('sends the version along', async () => {
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );
    return introspect({ domain, stateHandle, version })
      .then( result => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'http://okta.example.com/idp/idx/introspect' );
        expect( fetch.mock.calls[0][1] ).toEqual( {
          body: '{"stateToken":"FAKEY-FAKE"}',
          headers: {
            'content-type': 'application/ion+json; okta-version=1.0.0',
            'accept': 'application/ion+json; okta-version=1.0.0',
          },
          method: "POST"
        });
      });
  });

  it('requires a version', async () => { 
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );
    return introspect({ domain, stateHandle })
      .then( () => { 
        fail('expected introspect to reject when not provided a version');
      })
      .catch( err => { 
        expect(err).toEqual( new Error('invalid version supplied - version is required and uses semver syntax') );
      });
  });

  it('rejects if the version is bad', async () => { 
    fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );
    return introspect({ domain, stateHandle })
      .then( () => { 
        fail('expected introspect to reject when provided a bad version number');
      })
      .catch( err => { 
        expect(err).toEqual( new Error('invalid version supplied - version is required and uses semver syntax') );
      });
  });

});
