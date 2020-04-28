import { parseIdxResponse } from './idxResponseParser';

const makeIdxState = function makeIdxState( idxResponse ) {
  const rawIdxResponse =  idxResponse;
  const { remediations, context, actions } = parseIdxResponse( idxResponse );
  const neededToProceed = [...remediations];


  const proceed = async function( remediationChoice, paramsFromUser = {} ) {
    const remediationChoiceObject = remediations.find((remediation) => remediation.name === remediationChoice);
    if ( !remediationChoiceObject ) {
      return Promise.reject(`Unknown remediation choice: [${remediationChoice}]`);
    }

    return remediationChoiceObject.action(paramsFromUser);
  };

  return {
    proceed,
    neededToProceed,
    actions,
    context,
    rawIdxState: rawIdxResponse,
  };
};

export default makeIdxState;
