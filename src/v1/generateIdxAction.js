import fetch from 'cross-fetch';
import { divideActionParamsByMutability } from './actionParser';
import makeIdxState from './makeIdxState';

const generateDirectFetch = function generateDirectFetch( { actionDefinition, defaultParamsForAction = {}, immutableParamsForAction = {} } ) {
  const target = actionDefinition.href;
  let responseMeta; 
  return async function(params) {
    return fetch(target, {
      method: actionDefinition.method,
      headers: {
        'content-type': 'application/json',
        'accepts': actionDefinition.accepts || 'application/ion+json',
      },
      body: JSON.stringify({ ...defaultParamsForAction, ...params, ...immutableParamsForAction })
    })
      .then( response => { 
        responseMeta = response;
        return response.json();
      })
      .then( parsedResponse => { 
        try { 
          return makeIdxState(parsedResponse, responseMeta);
        } catch { 
          return Promise.reject(parsedResponse); 
        }
      });
  };
};

// TODO: Resolve in M2: Either build the final polling solution or remove this code
// const generatePollingFetch = function generatePollingFetch( { actionDefinition, defaultParamsForAction = {}, immutableParamsForAction = {} } ) {
//   // TODO: Discussions ongoing about when/how to terminate polling: OKTA-246581
//   const target = actionDefinition.href;
//   return async function(params) {
//     return fetch(target, {
//       method: actionDefinition.method,
//       headers: {
//         'content-type': actionDefinition.accepts,
//       },
//       body: JSON.stringify({ ...defaultParamsForAction, ...params, ...immutableParamsForAction })
//     })
//       .then( response => response.ok ? response.json() : response.json().then( err => Promise.reject(err)) )
//       .then( idxResponse => makeIdxState(idxResponse) );
//   };
// };

const generateIdxAction = function generateIdxAction( actionDefinition ) {
  // TODO: leaving this here to see where the polling is EXPECTED to drop into the code, but removing any accidental trigger of incomplete code
  // const generator =  actionDefinition.refresh ? generatePollingFetch : generateDirectFetch;
  const generator = generateDirectFetch;
  const { defaultParams, neededParams, immutableParams } = divideActionParamsByMutability( actionDefinition );

  const action = generator( { 
    actionDefinition, 
    defaultParamsForAction: defaultParams[actionDefinition.name], 
    immutableParamsForAction: immutableParams[actionDefinition.name],
  });
  action.neededParams = neededParams;
  return action;
};

export default generateIdxAction;
