import fetch from 'cross-fetch';
import { divideActionParamsByAutoStatus } from './actionParser';
import makeIdxState from './makeIdxState';

const generateDirectFetch = function generateDirectFetch( actionDefinition, existingParams = {} ) {
  const target = actionDefinition.href;
  return async function(params) {
    return fetch(target, {
      method: actionDefinition.method,
      headers: {
        'content-type': actionDefinition.accepts,
      },
      body: JSON.stringify({ ...params, ...existingParams })
    })
      // .then( response => response.ok ? response.json() : response.json().then( err => Promise.reject(err)) )
      .then( response => {
        const resp = response.json();
        if (response.ok) {
          return resp;
        } else {
          const token = resp.stateHandle;
          const isV1StateToken = !!(token && token.startsWith('00'));
          if (isV1StateToken) {
            return resp.then( err => Promise.reject(err));
          } else {
            return resp;
          }
        }
      })
      .then( idxResponse => {
        console.log('********generateDirectFetch*******');
        return makeIdxState(idxResponse);
      });
  };
};

const generatePollingFetch = function generatePollingFetch( actionDefinition, existingParams = {} ) {
  // TODO: Discussions ongoing about when/how to terminate polling: OKTA-246581
  const target = actionDefinition.href;
  return async function(params) {
    return fetch(target, {
      method: actionDefinition.method,
      headers: {
        'content-type': actionDefinition.accepts,
      },
      body: JSON.stringify({ ...params, ...existingParams })
    })
      .then( response => response.ok ? response.json() : response.json().then( err => Promise.reject(err)) )
      .then( idxResponse => makeIdxState(idxResponse));
  };
};

const generateIdxAction = function generateIdxAction( actionDefinition ) {
  const generator =  actionDefinition.refresh ? generatePollingFetch : generateDirectFetch;
  const { neededParams, existingParams } = divideActionParamsByAutoStatus( actionDefinition );

  const action = generator( actionDefinition, existingParams[actionDefinition.name] );
  action.neededParams = neededParams[actionDefinition.name];
  return action;
};

export default generateIdxAction;
