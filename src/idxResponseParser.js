import { generateRemediationFunctions } from './remediationParser';
import generateIdxAction from './generateIdxAction';

const SKIP_FIELDS = {
  remediation: true, // remediations are put into proceed/neededToProceed
  context: true, // the API response of 'context' isn't externally useful.  We ignore it and put all non-action (contextual) info into idxState.context
  cancel: true, // already included in 'actions'
};

const SIMPLE_ACTIONS = {
  cancel: true, // 'cancel' is a top-level always-present action
};

export const parseNonRemediations = function parseNonRemediations( idxResponse ) {
  const actions = {};
  const context = {};

  Object.keys(SIMPLE_ACTIONS).filter( field => !!idxResponse[field]).forEach( field => {
    actions[field] = generateIdxAction(idxResponse[field]);
  });

  Object.keys(idxResponse).filter( field => !SKIP_FIELDS[field]).forEach( field => {
    const fieldIsObject = typeof idxResponse[field] === 'object' && !!idxResponse[field];

    if (!fieldIsObject) {
      // simple fields are contextual info
      context[field] = idxResponse[field];
      return;
    }

    const { value: fieldValue, type, ...info} = idxResponse[field];
    context[field] = { type, ...info}; // add the non-action parts as context

    if ( type !== 'object' ) {
      // only object values hold actions
      context[field].value = fieldValue;
      return;
    }

    // We are an object field containing an object value
    context[field].value = {};
    Object.entries(fieldValue).forEach( ([subField, value]) => {
      if (value.rel) { // is [field].value[subField] an action?
        // add any "action" value subfields to actions
        actions[`${field}-${subField.name || subField}`] = generateIdxAction(value);
      } else {
        // add non-action value subfields to context
        context[field].value[subField] = value;
      }
    });
  });

  return { context, actions };
};

export const parseIdxResponse = function parseIdxResponse( idxResponse ) {

  const remediations = generateRemediationFunctions( idxResponse.remediation?.value || [] );
  const { context, actions } = parseNonRemediations( idxResponse );

  return {
    remediations,
    context,
    actions,
  };
};
