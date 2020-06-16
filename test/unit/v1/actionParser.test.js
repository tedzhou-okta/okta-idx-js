import { divideActionParamsByMutability } from '../../../src/v1/actionParser';

const mockIdxResponse = require('../../mocks/request-identifier');

describe('actionParser', () => { 
  describe('divideActionParamsByMutability', () => {

    it('parses and splits multiple remediations', async () => {
      const { defaultParams, neededParams, immutableParams } = divideActionParamsByMutability( mockIdxResponse.remediation.value );

      expect( defaultParams ).toEqual({
        identify: {}, 
        "select-enroll-profile": {},
      });

      expect( neededParams ).toEqual([[{"label": "Username", "name": "identifier"}], []]);

      expect( immutableParams ).toEqual({
        identify: {stateHandle: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw'},
        'select-enroll-profile': {stateHandle: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw'},
      });
    });

    it('parses and splits a non-remediation', async () => {
      const { defaultParams, neededParams, immutableParams } = divideActionParamsByMutability( mockIdxResponse.cancel);

      expect( defaultParams.cancel ).toEqual({});
      expect( neededParams ).toEqual([[]]);
      expect( immutableParams.cancel ).toEqual({
        stateHandle: '02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw',
      });
    });
  });
});
