import fetch from 'cross-fetch';
import { divideActionParamsByMutability } from './actionParser';
import makeIdxState from './makeIdxState';

const generateDirectFetch = function generateDirectFetch( { actionDefinition, defaultParamsForAction = {}, immutableParamsForAction = {} } ) {
  const target = actionDefinition.href;
  return async function(params) {
    return fetch(target, {
      method: actionDefinition.method,
      headers: {
        'content-type': actionDefinition.accepts,
      },
      body: JSON.stringify({ ...defaultParamsForAction, ...params, ...immutableParamsForAction })
    })
      .then( response => {
        const respJson = response.json();
        if (response.ok) {
          return respJson;
        } else if (response.status === 401 && response.headers.get('WWW-Authenticate') === 'Oktadevicejwt realm="Okta Device"') {
          // Okta server responds 401 status code with WWW-Authenticate header and new remediation
          // so that the iOS/MacOS credential SSO extension (Okta Verify) can intercept
          // the response reaches here when Okta Verify is not installed
          // we need to return an idx object so that
          // the SIW can proceed to the next step without showing error
          return respJson.then(err => Promise.reject(makeIdxState(err)) );
        }
        return respJson.then(err => Promise.reject(err));
      })
      .then( idxResponse => makeIdxState(idxResponse) );
  };
};

const generatePollingFetch = function generatePollingFetch( { actionDefinition, defaultParamsForAction = {}, immutableParamsForAction = {} } ) {
  // TODO: Discussions ongoing about when/how to terminate polling: OKTA-246581
  const target = actionDefinition.href;
  return async function(params) {
    return fetch(target, {
      method: actionDefinition.method,
      headers: {
        'content-type': actionDefinition.accepts,
      },
      body: JSON.stringify({ ...defaultParamsForAction, ...params, ...immutableParamsForAction })
    })
      .then( response => response.ok ? response.json() : response.json().then( err => Promise.reject(err)) )
      .then( idxResponse => makeIdxState(idxResponse) );
  };
};

const generateIdxAction = function generateIdxAction( actionDefinition ) {
  const generator =  actionDefinition.refresh ? generatePollingFetch : generateDirectFetch;
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
