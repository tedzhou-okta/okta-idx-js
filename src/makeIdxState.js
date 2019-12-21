import { parseIdxResponse } from './idxResponseParser';

const makeIdxState = function( idxResponse ) {

  const { remediations, context, actions, neededToProceed, sentWithProceed } = parseIdxResponse( idxResponse );
  const proceed = async function( remediationChoice, paramsFromUser ) {
    if( !remediations[remediationChoice] ) {
      return Promise.reject(`Unknown remediation choice: [${remediationChoice}]`);
    }
    return remediations[remediationChoice]({ ...paramsFromUser, ...sentWithProceed[remediationChoice] })
      .then( idxResponse => makeIdxState( idxResponse ) );
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
