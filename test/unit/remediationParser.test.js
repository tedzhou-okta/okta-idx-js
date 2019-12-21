import { divideActionParamsByAutoStatus, generateRemediationFunctions } from '../../src/remediationParser';

jest.mock('cross-fetch');
jest.mock('../../src/generateIdxAction');

// imports to target for mockery
import fetch from 'cross-fetch'; 
import generateIdxAction from '../../src/generateIdxAction';

const { Response } = jest.requireActual('cross-fetch');
const mockRequestIdentity = require('../mocks/request-identifier');
const mockIdxResponse = mockRequestIdentity;

fetch.mockImplementation( () => Promise.resolve( new Response(JSON.stringify( mockRequestIdentity )) ) );
generateIdxAction.mockImplementation( () => 'generated');

describe('remediationParser', () => {

  describe('divideActionsParamsByAutoStatus', () => {

    it('parses and splits', async () => {
      const { neededParams, existingParams } = divideActionParamsByAutoStatus( mockIdxResponse.remediation.value );

      expect( neededParams ).toMatchObject({
        identify: [ { name: 'identifier', label: 'Username' } ],
        'select-enroll-profile': [],
      });

      expect( existingParams ).toMatchObject({
        identify: {"stateHandle": "02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"},
        'select-enroll-profile': {"stateHandle": "02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"},
      });
    });
  });

  describe('generateRemediationFunctions', () => {

    it('builds a collection of generated functions', async () => {
      const remediationFunctions = generateRemediationFunctions(mockIdxResponse.remediation.value);
      expect( Object.keys(remediationFunctions) ).toEqual( ['identify', 'select-enroll-profile'] );
      expect(generateIdxAction.mock.calls[0]).toMatchObject([mockIdxResponse.remediation.value[0]]);
      expect(generateIdxAction.mock.calls[1]).toMatchObject([mockIdxResponse.remediation.value[1]]);
      expect(remediationFunctions['identify']).toBe('generated');
      expect(remediationFunctions['select-enroll-profile']).toBe('generated');
    });

  });

});

