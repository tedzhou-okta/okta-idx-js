import { parseNonRemediations, parseIdxResponse } from '../../src/idxResponseParser';

const mockIdxResponse = require('../mocks/challenge-password');
const mockSmallIdxResponse = require('../mocks/request-identifier');
const mockComplexContextIdxResponse = require('../mocks/poll-for-password');
const mockTerminalIdxResponse = require('../mocks/terminal-return-email');
const mockMessageIdxResponse = require('../mocks/unknown-user');
const mockSuccessIdxResponse = require('../mocks/success');

jest.mock('../../src/generateIdxAction');
jest.mock('../../src/remediationParser');
jest.mock('../../src/actionParser');

// imports to target for mockery
import { generateRemediationFunctions } from '../../src/remediationParser';
import { divideActionParamsByAutoStatus } from '../../src/actionParser';
import generateIdxAction from '../../src/generateIdxAction';

generateIdxAction.mockReturnValue('generated function');
generateRemediationFunctions.mockReturnValue('generated collection of functions');
divideActionParamsByAutoStatus.mockReturnValue( { neededParams: 'neededParams', existingParams: 'existingParams'});

describe('idxResponseParser', () => { 
  describe('parseNonRemediations', () => { 

    it('copies simple context items', () => { 
      const { context } = parseNonRemediations( mockIdxResponse );
      expect( context ).toEqual({
        expiresAt: mockIdxResponse.expiresAt,
        step: mockIdxResponse.step,
        intent: mockIdxResponse.intent,
        user: mockIdxResponse.user,
        stateHandle: mockIdxResponse.stateHandle,
        version: '1.0.0',
        factor: { 
          type: 'object', 
          value: { 
            factorId: '00u1wlnlh2x3sQemR357',
            factorProfileId: 'fpr1w2vlszZt2g3E4357',
            factorType: 'password',
          },
        },
      });
    });

    it('copies terminal messages', () => { 
      const { context } = parseNonRemediations( mockTerminalIdxResponse );
      expect( context.terminal ).toEqual( mockTerminalIdxResponse.terminal );
    });

    it('copies non-terminal messages', () => { 
      const { context } = parseNonRemediations( mockMessageIdxResponse );
      expect( context.messages ).toEqual( mockMessageIdxResponse.messages );
    });

    it('copies token info', () => { 
      const { context } = parseNonRemediations( mockSuccessIdxResponse );
      expect( context.success ).toMatchObject( mockSuccessIdxResponse.success );
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

    it('builds remediation functions', () => {
      const { remediations } = parseIdxResponse( mockIdxResponse );
      expect( generateRemediationFunctions.mock.calls.length ).toBe(1);
      expect( generateRemediationFunctions.mock.calls[0] ).toMatchObject( [mockIdxResponse.remediation.value] );
      expect( remediations[0].name ).toBe('challenge-factor');
      expect( remediations[0].href ).toBe('https://dev-550580.okta.com/idp/idx/challenge/answer');
      expect( remediations[0].method ).toBe('POST');
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
