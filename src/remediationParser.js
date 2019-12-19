import fetch from 'cross-fetch';

export const fieldIsAutoSent = function( field ) {
  if(!field.visible && field.value) {
    return true;
  }
  return false;
};

export const divideParamsByAutoStatus = function divideParamsByAutoStatus( remediationList ) {
  const neededToProceed = {};
  const sentWithProceed = {};

  for( let remediation of remediationList ) {
    neededToProceed[remediation.name] = [];
    sentWithProceed[remediation.name] = [];
    for( let field of remediation.value ) {
      if( fieldIsAutoSent( field ) ) {
        sentWithProceed[remediation.name].push({ [field.name]: field.value ?? '' });
      } else {
        neededToProceed[remediation.name].push(field);
      }
    }
  }
  return { neededToProceed, sentWithProceed };
};

export const generateRemediationFunction = function generateRemediationFunction( remediation ) {
  const target = remediation.href;
  return async function (params) {
    return fetch(target, {
      method: remediation.method,
      headers: {
        'content-type': remediation.accepts,
      },
      body: JSON.stringify( params )
    })
      .then( response => response.ok ? response.json() : Promise.reject( response ) );
  };
};


