import { divideActionParamsByAutoStatus } from '../../src/actionParser';

const mockIdxResponse = require('../mocks/request-identifier');

describe('actionParser', () => { 
  describe('divideActionsParamsByAutoStatus', () => {

    it('parses and splits multiple remediations', async () => {
      const { neededParams, existingParams } = divideActionParamsByAutoStatus( mockIdxResponse.remediation.value );

      expect( neededParams ).toMatchObject({
        identify: [ { name: 'identifier', label: 'Username' } ],
        'select-enroll-profile': [],
      });

      expect( existingParams ).toMatchObject({
        identify: {stateHandle: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw'},
        'select-enroll-profile': {stateHandle: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw'},
      });
    });

    it('parses and splits a non-remediation', async () => {
      const { neededParams, existingParams } = divideActionParamsByAutoStatus( mockIdxResponse.cancel);

      expect( neededParams.cancel ).toMatchObject([]);
      expect( existingParams.cancel ).toMatchObject({
        stateHandle: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw',
      });
    });
  });
});
