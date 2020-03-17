import { parseIdxResponse } from './idxResponseParser';

const makeIdxState = function makeIdxState( idxResponse ) {

  console.log('enter makeIdxState +++++', idxResponse);
  const { remediations, context, actions } = parseIdxResponse( idxResponse );

  const neededToProceed = {};
  Object.entries(remediations).forEach( ([name, action]) => {
    neededToProceed[name] = action.neededParams;
  });

  const proceed = async function( remediationChoice, paramsFromUser = {} ) {
    console.log('entering proceed');
    if ( !remediations[remediationChoice] ) {
      console.log(`Unknown remediation choice: [${remediationChoice}]`);
      return Promise.reject(`Unknown remediation choice: [${remediationChoice}]`);
    }
    // const pro = remediations[remediationChoice](paramsFromUser);
    // console.log('executing remediations: ', pro);
    // pro.catch(resp => {
    //           console.log('---------1', resp);
    //         });
    return remediations[remediationChoice](paramsFromUser);
  };

  return {
    proceed,
    neededToProceed,
    actions,
    context,
    rawIdxState: idxResponse,
    a: "test",
  };
};

export default makeIdxState;
