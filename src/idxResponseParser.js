import { divideActionParamsByAutoStatus, generateRemediationFunctions } from './remediationParser';
import generateIdxAction from './generateIdxAction';

export const SIMPLE_CONTEXT_FIELDS = [
  'expiresAt',
  'step',
  'intent',
  'user',
  'factors',
  'messages',
  'terminal',
  'success',
];

export const COMPLEX_CONTEXT_FIELDS = [
  'factor',
];

export const SIMPLE_ACTION_FIELDS = [
  'cancel',
];
// TODO: authenticatorChallenge?

export const parseNonRemediations = function parseNonRemediations( idxResponse ) {
  const actions = {};
  const context = {};

  // Context fields that are unchanged
  for( let field of SIMPLE_CONTEXT_FIELDS ) {
    if( idxResponse[field] ) {
      context[field] = idxResponse[field];
    }
  }

  // Action fields that are straightforward
  for( let field of SIMPLE_ACTION_FIELDS ) {
    if( idxResponse[field] ) {
      actions[field] = generateIdxAction(idxResponse[field]);
    }
  }

  // Fields that are part context and part action
  for( let field of COMPLEX_CONTEXT_FIELDS ) {
    if( idxResponse[field] ) {
      const { value: fieldValue, ...info} = idxResponse[field];
      context[field] = info; // add the non-action parts as context
      context[field].value = {};
      Object.entries(fieldValue).forEach( ([subField, value]) => {
        if(value.rel) { // is [field].value[subField] an action?
          // add any "action" value subfields to actions
          actions[`${field}-${subField.name || subField}`] = generateIdxAction(value);
        } else {
          // add non-action value subfields to context
          context[field].value[subField] = value;
        }
      });
    }
  }

  return { context, actions };
};

export const parseIdxResponse = function parseIdxResponse( idxResponse ) {

  const { neededParams, existingParams } = divideActionParamsByAutoStatus( idxResponse.remediation.value );
  const remediations = generateRemediationFunctions( idxResponse.remediation.value );
  const { context, actions } = parseNonRemediations( idxResponse );

  return {
    neededToProceed: neededParams,
    sentWithProceed: existingParams,
    remediations,
    context,
    actions,
  };
};
