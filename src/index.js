import { divideParamsByAutoStatus, generateRemediationFunction } from './remediationParser';
import { introspect } from './introspect';

const makeIdxState = function({ stateHandle, idxResponse }) {
  const { neededToProceed, sentWithProceed } = divideParamsByAutoStatus( idxResponse.remediation.value );

  const remediations = Object.fromEntries( idxResponse.remediation.value.map( remediation => {
    return [
      remediation.name,
      generateRemediationFunction(remediation),
    ]
  }) );

  const proceed = async function( remediationChoice, paramsFromUser ) {
    if( !remediations[remediationChoice] ) {
      return Promise.reject(`Unknown remediation choice: [${remediationChoice}]`);
    }
    return remediations[remediationChoice]({ ...paramsFromUser, ...sentWithProceed });
  };

  return {
    proceed,
    neededToProceed,
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
    .catch( err => Promise.reject({ error: 'intropspect call failed', details: err }) );
  const idxState = makeIdxState({ stateHandle, idxResponse });
  return idxState;
};

export default {
  start,
};
