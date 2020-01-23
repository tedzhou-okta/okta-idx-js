import { generateRemediationFunctions } from '../../src/remediationParser';

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


  describe('generateRemediationFunctions', () => {

    it('builds a collection of generated functions', async () => {
      const remediationFunctions = generateRemediationFunctions(mockIdxResponse.remediation.value);
      expect( Object.keys(remediationFunctions) ).toEqual( ['identify', 'select-enroll-profile'] );
      expect(generateIdxAction.mock.calls[0]).toEqual([mockIdxResponse.remediation.value[0]]);
      expect(generateIdxAction.mock.calls[1]).toEqual([mockIdxResponse.remediation.value[1]]);
      expect(remediationFunctions['identify']).toBe('generated');
      expect(remediationFunctions['select-enroll-profile']).toBe('generated');
    });

  });

});

