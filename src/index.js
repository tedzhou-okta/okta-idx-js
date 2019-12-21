import { parseIdxResponse } from './idxResponseParser';
import { introspect } from './introspect';

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

const start = async function start({ domain, stateHandle }) {
  if( !stateHandle ) {
    return Promise.reject({ error: 'stateHandle is required' });
  }

  if( !domain ) {
    return Promise.reject({ error: 'domain is required' });
  }

  const idxResponse = await introspect({ domain, stateHandle })
    .catch( err => Promise.reject({ error: 'introspect call failed', details: err }) );
  const idxState = makeIdxState( idxResponse );
  return idxState;
};

export default {
  start,
};
