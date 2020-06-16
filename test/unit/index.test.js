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

describe('idx-js', () => {
  describe('start', () => {

    it('rejects without a stateHandle', async () => {
      return idx.start({ domain, version })
        .then( () => {
          fail('expected idx.start to reject when not given a stateHandle');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'stateHandle is required'});
        });
    });

    it('rejects without a domain', async () => {
      return idx.start({ stateHandle, version })
        .then( () => {
          fail('expected idx.start to reject when not given a domain');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'domain is required'});
        });
    });

    it('rejects without a version', async () => {
      return idx.start({ stateHandle, domain })
        .then( () => {
          fail('expected idx.start to reject when not given a version');
        })
        .catch( err => {
          expect(err).toStrictEqual({ error: 'version is required'});
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
