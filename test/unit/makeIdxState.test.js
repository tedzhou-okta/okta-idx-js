import makeIdxState from '../../src/makeIdxState';
const mockIdxResponse = require('../mocks/request-identifier');

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery
const { Response } = jest.requireActual('cross-fetch');

fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );

describe('makeIdxState', () => {
  it('returns an idxState', () => {
    const idxState = makeIdxState( mockIdxResponse );
    expect(idxState).toBeDefined();
    expect(idxState.context).toBeDefined();
    expect(typeof idxState.proceed).toBe('function');
    expect(typeof idxState.actions.cancel).toBe('function');
    expect(idxState.rawIdxState).toMatchObject(mockIdxResponse);
  });

  it('populates neededToProceed with Ion data', () => {
    const idxState = makeIdxState( mockIdxResponse );
    expect(idxState.neededToProceed).toMatchObject({
      identify: [ { name: 'identifier', label: 'Username' } ],
      'select-enroll-profile': [],
    });
  });

  it('populates proceed to run remediation functions', () => {
    const idxState = makeIdxState( mockIdxResponse );
    expect( typeof idxState.proceed ).toBe('function');
  });

  describe('idxState.proceed', () => {
    it('rejects if called with an invalid remediationChoice', async () => {
      const idxState = makeIdxState( mockIdxResponse );
      return idxState.proceed('DOES_NOT_EXIST')
        .then( () => {
          fail('expected idxState.proceed to reject');
        })
        .catch( err => {
          expect(err).toBe('Unknown remediation choice: [DOES_NOT_EXIST]');
        });
    });

    it('returns a new idxState', async () => {
      const idxState = makeIdxState( mockIdxResponse );
      return idxState.proceed('identify')
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
          expect(result.rawIdxState).toMatchObject(mockIdxResponse);
        });
    });
  });

  describe('idxState.actions', () => {
    it('return a new idxState', async () => {
      const idxState = makeIdxState( mockIdxResponse );
      return idxState.actions.cancel()
        .then( result => {
          // Note: cancel won't return this data
          // this is verifying the parsing happens on mock data
          expect(result.rawIdxState).toMatchObject(mockIdxResponse);
        });
    });
  });
});
