import { divideActionParamsByAutoStatus } from '../../src/actionParser';

const mockIdxResponse = require('../mocks/request-identifier');

describe('actionParser', () => { 
  describe('divideActionsParamsByAutoStatus', () => {

    it('parses and splits multiple remediations', async () => {
      const { neededParams, existingParams } = divideActionParamsByAutoStatus( mockIdxResponse.remediation.value );

      expect( neededParams ).toEqual({
        identify: [ { name: 'identifier', label: 'Username' } ],
        'select-enroll-profile': [],
      });

      expect( existingParams ).toEqual({
        identify: {stateHandle: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw'},
        'select-enroll-profile': {stateHandle: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw'},
      });
    });

    it('parses and splits a non-remediation', async () => {
      const { neededParams, existingParams } = divideActionParamsByAutoStatus( mockIdxResponse.cancel);

      expect( neededParams.cancel ).toEqual([]);
      expect( existingParams.cancel ).toEqual({
        stateHandle: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw',
      });
    });
  });
});
