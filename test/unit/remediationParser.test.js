import { divideParamsByAutoStatus, generateRemediationFunction } from '../../src/remediationParser';

jest.mock('cross-fetch');
import fetch from 'cross-fetch'; // import to target for mockery

const { Response } = jest.requireActual('cross-fetch');
const mockRequestIdentity = require('../mocks/request-identifier');
const mockIdxResponse = mockRequestIdentity;

fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockRequestIdentity )) ) );

describe('remediationParser', () => {

  describe('divideParamsByAutoStatus', () => {

    it('parses and splits', async () => {
      const { neededToProceed, sentWithProceed } = divideParamsByAutoStatus( mockIdxResponse.remediation.value );

      expect( neededToProceed).toMatchObject({
        identify: [ { name: 'identifier', label: 'Username' } ],
        'select-enroll-profile': [],
      });

      expect( sentWithProceed ).toMatchObject({
        identify: [ {"stateHandle": "02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"} ],
        'select-enroll-profile': [ {"stateHandle": "02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"} ],
      });
    });
  });

  describe('generateRemediationFunction', () => {

    it('builds a function', () => {
      const remediationFunction = generateRemediationFunction(mockIdxResponse.remediation.value[0]);
      expect(typeof remediationFunction).toBe('function');
    });

    it('returns a function that returns a fetch result', async () => {
      const remediationFunction = generateRemediationFunction(mockIdxResponse.remediation.value[0]);
      return remediationFunction()
        .then( result => {
          expect( fetch.mock.calls.length ).toBe(1);
          expect( result ).toMatchObject( mockIdxResponse );
        });
    });
  });

});

