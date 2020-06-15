import { generateRemediationFunctions } from '../../../src/v1/remediationParser';

// imports to target for mockery
import fetch from 'cross-fetch'; 
import generateIdxAction from '../../../src/v1/generateIdxAction';

jest.mock('cross-fetch');
/*
  Doing a jest.mock('../../src/generateIdxAction') has problems with jest.mock causing the test to hang
  and spikes up the CPU usage for the current node process.
  Alternative mocking approach: https://jestjs.io/docs/en/es6-class-mocks
*/
const mockGenerateIdxAction = jest.fn();
jest.mock('../../../src/v1/generateIdxAction', () => {
  return jest.fn().mockImplementation(() => {
    return {generateIdxAction: mockGenerateIdxAction};
  });
});

const { Response } = jest.requireActual('cross-fetch');
const mockRequestIdentity = require('../../mocks/request-identifier');
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

