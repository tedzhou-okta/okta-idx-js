import { parseIdxResponse } from './idxResponseParser';

const makeIdxState = function makeIdxState( idxResponse ) {

  const { remediations, context, actions } = parseIdxResponse( idxResponse );

  const neededToProceed = {};
  Object.entries(remediations).forEach( ([name, action]) => {
    neededToProceed[name] = action.neededParams;
  });

  const proceed = async function( remediationChoice, paramsFromUser = {} ) {
    if ( !remediations[remediationChoice] ) {
      return Promise.reject(`Unknown remediation choice: [${remediationChoice}]`);
    }

    return remediations[remediationChoice](paramsFromUser);
  };

  return {
    proceed,
    neededToProceed,
    actions,
    context,
    rawIdxState: idxResponse,
  };
};

export default makeIdxState;
