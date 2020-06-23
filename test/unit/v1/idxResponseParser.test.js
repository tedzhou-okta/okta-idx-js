import { parseNonRemediations, parseIdxResponse } from '../../../src/v1/idxResponseParser';

const mockIdxResponse = require('../../mocks/challenge-password');
const mockAuthenticatorVerificationSelectAuthenticator = require('../../mocks/authenticator-verification-select-authenticator');
const mockSmallIdxResponse = require('../../mocks/request-identifier');
const mockComplexContextIdxResponse = require('../../mocks/poll-for-password');
const mockTerminalIdxResponse = require('../../mocks/terminal-return-email');
const mockMessageIdxResponse = require('../../mocks/unknown-user');
const mockSuccessIdxResponse = require('../../mocks/success');

jest.mock('../../../src/v1/generateIdxAction');
jest.mock('../../../src/v1/remediationParser');
jest.mock('../../../src/v1/actionParser');

// imports to target for mockery
import { generateRemediationFunctions } from '../../../src/v1/remediationParser';
import { divideActionParamsByMutability } from '../../../src/v1/actionParser';
import generateIdxAction from '../../../src/v1/generateIdxAction';

generateIdxAction.mockReturnValue('generated function');
generateRemediationFunctions.mockReturnValue('generated collection of functions');
divideActionParamsByMutability.mockReturnValue( { defaultParams: 'defaultParams', neededParams: 'neededParams', immutableParams: 'immutableParams'});

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
      expect( context.factor ).toStrictEqual({
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
      expect( context.factor ).toStrictEqual({
        type: 'object',
        value: {
          factorId: 'emf2a6n2omrZ7Abnt357',
          factorProfileId: 'fpr1w2vlstxSAQsHZ357',
          factorType: 'email',
          profile: {
            email: 'test.idx@swiftone.org',
          },
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
      expect( context ).toStrictEqual({
        expiresAt: mockIdxResponse.expiresAt,
        step: mockIdxResponse.step,
        intent: mockIdxResponse.intent,
        user: mockIdxResponse.user,
        factor: {
          type: 'object',
          value: {
            factorType: mockIdxResponse.factor.value.factorType,
            factorProfileId: mockIdxResponse.factor.value.factorProfileId,
            factorId: mockIdxResponse.factor.value.factorId,
          }
        },
        stateHandle: mockIdxResponse.stateHandle,
        version: mockIdxResponse.version,
      });
      expect( actions.cancel ).toBe('generated function');
    });

    it('builds remediation functions with expanded relatesTo', () => {
      const { remediations } = parseIdxResponse( mockAuthenticatorVerificationSelectAuthenticator );
      expect( generateRemediationFunctions.mock.calls.length ).toBe(1);
      expect( generateRemediationFunctions.mock.calls[0] ).toMatchObject( [mockAuthenticatorVerificationSelectAuthenticator.remediation.value] );
      expect( remediations[0].name ).toBe('select-authenticator-authenticate');
      expect( remediations[0].href ).toBe('http://localhost:3000/idp/idx/challenge');
      expect( remediations[0].method ).toBe('POST');
      expect( remediations[0].value ).toMatchSnapshot();
    });

  });
});
