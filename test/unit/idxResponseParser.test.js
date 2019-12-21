import { parseNonRemediations, parseIdxResponse } from '../../src/idxResponseParser';

const mockIdxResponse = require('../mocks/challenge-password');
const mockSmallIdxResponse = require('../mocks/request-identifier');
const mockComplexContextIdxResponse = require('../mocks/poll-for-password');

jest.mock('../../src/generateIdxAction');
jest.mock('../../src/remediationParser');

// imports to target for mockery
import { divideActionParamsByAutoStatus, generateRemediationFunctions } from '../../src/remediationParser';
import generateIdxAction from '../../src/generateIdxAction';

generateIdxAction.mockReturnValue('generated function');
generateRemediationFunctions.mockReturnValue('generated collection of functions');
divideActionParamsByAutoStatus.mockReturnValue( { neededParams: 'neededParams', existingParams: 'existingParams'});

describe('idxResponseParser', () => { 
  describe('parseNonRemediations', () => { 

    it('filters out simple context items', () => { 
      const { context } = parseNonRemediations( mockIdxResponse );
      expect( context ).toMatchObject({
        expiresAt: mockIdxResponse.expiresAt,
        step: mockIdxResponse.step,
        intent: mockIdxResponse.intent,
        user: mockIdxResponse.user,
      });
    });

    it('handles missing simple context items', () => { 
      const { context } = parseNonRemediations( mockSmallIdxResponse );
      expect(mockSmallIdxResponse.user).not.toBeDefined();
      expect(context.user).not.toBeDefined();
    });

    it('translates simple actions', () => { 
      const { actions } = parseNonRemediations( mockIdxResponse );
      expect( actions.cancel ).toBe('generated function');
    });

    it('pulls apart complicated actions/context', () => { 
      const { context, actions } = parseNonRemediations( mockIdxResponse );
      expect( actions['factor-recover'] ).toBe('generated function');
      expect( context.factor ).toMatchObject({
        type: 'object', 
        value: {
          factorId: '00u1wlnlh2x3sQemR357', 
          factorProfileId: 'fpr1w2vlszZt2g3E4357', 
          factorType: 'password'
        }
      });
    });

    it('handles multiple actions in a complex context field', () => { 
      const { context, actions } = parseNonRemediations( mockComplexContextIdxResponse );
      expect( actions['factor-send'] ).toBe('generated function');
      expect( actions['factor-poll'] ).toBe('generated function');
      expect( context.factor ).toMatchObject({
        type: 'object', 
        value: {
          factorId: 'emf2a6n2omrZ7Abnt357', 
          factorProfileId: 'fpr1w2vlstxSAQsHZ357', 
          factorType: 'email'
        }
      });
    });
  });

  describe('parseIdxResponse', () => { 

    it('divides remediation values', () => { 
      const { neededToProceed, sentWithProceed } = parseIdxResponse( mockIdxResponse );
      expect( divideActionParamsByAutoStatus.mock.calls.length ).toBe(1);
      expect( neededToProceed ).toBe('neededParams');
      expect( sentWithProceed ).toBe('existingParams');
    });

    it('builds remediation functions', () => {
      const { remediations } = parseIdxResponse( mockIdxResponse );
      expect( generateRemediationFunctions.mock.calls.length ).toBe(1);
      expect( generateRemediationFunctions.mock.calls[0] ).toMatchObject( [mockIdxResponse.remediation.value] );
      expect( remediations ).toBe('generated collection of functions');
    });

    it('builds context and actions', () => { 
      const { context, actions } = parseIdxResponse( mockIdxResponse );
      expect( context ).toMatchObject({
        expiresAt: mockIdxResponse.expiresAt,
        step: mockIdxResponse.step,
        intent: mockIdxResponse.intent,
        user: mockIdxResponse.user,
      });
      expect( actions.cancel ).toBe('generated function');
    });

  });
});
