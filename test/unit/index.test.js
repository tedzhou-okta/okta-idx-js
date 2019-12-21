import idx from '../../src/index';
//  We must import before webpack to be able to mock
//  Integration tests will run against webpacked code

// Note: All network interactions should be mocked
// All stateHandles and similar are fake
// See the integration tests for the full back-and-forth

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery
const mockRequestIdentity = require('../mocks/request-identifier');
const mockIdxResponse = mockRequestIdentity;
const { Response } = jest.requireActual('cross-fetch');

fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockRequestIdentity )) ) );

const stateHandle = 'FAKE_STATE_HANDLE';
const domain = 'http://okta.example.com';

describe('idx-js', () => {
  describe('start', () => {

    it('returns an idxState', async () => {
      return idx.start({ domain, stateHandle })
        .then( idxState => {
          expect(idxState).toBeDefined();
          expect(idxState.context).toBeDefined();
          expect(typeof idxState.proceed).toBe('function');
          expect(typeof idxState.actions.cancel).toBe('function');
          expect(idxState.rawIdxState).toMatchObject(mockRequestIdentity);
        });
    });

    it('populates neededToProceed with Ion data', async () => {
      return idx.start({ domain, stateHandle })
        .then( idxState => {
          expect(idxState.neededToProceed).toMatchObject({
            identify: [ { name: 'identifier', label: 'Username' } ],
            'select-enroll-profile': [],
          });
        });
    });

    it('populates proceed to run remediation functions', async () => {
      return idx.start({ domain, stateHandle })
        .then( idxState => { 
          expect( typeof idxState.proceed ).toBe('function');
        })
    }); 

    it('rejects without a stateHandle', async () => {
      return idx.start({ domain })
        .then( () => {
          fail('expected idx.start to reject when not given a stateHandle');
        })
        .catch( err => {
          expect(err).toMatchObject({ error: 'stateHandle is required'});
        });
    });

    it('rejects without a domain', async () => {
      return idx.start({ stateHandle })
        .then( () => {
          fail('expected idx.start to reject when not given a domain');
        })
        .catch( err => {
          expect(err).toMatchObject({ error: 'domain is required'});
        });
    });

    describe('idxState.proceed', () => {
      it('rejects if called with an invalid remediationChoice', async () => {
        return idx.start({ domain, stateHandle })
          .then( idxState => idxState.proceed('DOES_NOT_EXIST') )
          .then( () => {
            fail('expected idxState.proceed to reject');
          })
          .catch( err => {
            expect(err).toBe('Unknown remediation choice: [DOES_NOT_EXIST]');
          });
      });

      it('returns a new idxState', async () => {
        return idx.start({ domain, stateHandle })
          .then( idxState => idxState.proceed('identify') )
          .then( result => {
            expect( result.neededToProceed ).toMatchObject({ 
              identify: [ { 
                label: 'Username',
                name: 'identifier',
              } ],
            });
          expect(result.context).toBeDefined();
          expect(typeof result.proceed).toBe('function');
          expect(typeof result.actions.cancel).toBe('function');
          expect(result.rawIdxState).toMatchObject(mockRequestIdentity);
          });
      }); 
    });
  });
});
