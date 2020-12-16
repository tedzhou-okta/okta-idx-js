import idx from '../../src/index';
//  We must import before webpack to be able to mock
//  Integration tests will run against webpacked code

// Note: All network interactions should be mocked
// All stateHandles and similar are fake
// See the integration tests for the full back-and-forth

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery
const mockRequestIdentity = require('../mocks/request-identifier');
const { Response } = jest.requireActual('cross-fetch');

fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockRequestIdentity )) ) );

const stateHandle = 'FAKE_STATE_HANDLE';
const domain = 'http://okta.example.com';
const version = '1.0.0';
const clientId = 'CLIENT_ID';
const redirectUri = 'https://example.com/fake';

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

    it('rejects without a domain', async () => {
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
