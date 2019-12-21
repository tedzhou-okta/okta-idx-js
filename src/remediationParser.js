import generateIdxAction from './generateIdxAction';

export const fieldIsAutoSent = function( field ) {
  if(!field.visible && field.value) {
    return true;
  }
  return false;
};

export const divideActionParamsByAutoStatus = function divideActionParamsByAutoStatus( remediationList ) {
  const neededParams = {};
  const existingParams = {};

  for( let remediation of remediationList ) {
    neededParams[remediation.name] = [];
    existingParams[remediation.name] = {};
    for( let field of remediation.value ) {
      if( fieldIsAutoSent( field ) ) {
        existingParams[remediation.name][field.name] = field.value ?? '';
      } else {
        neededParams[remediation.name].push(field);
      }
    }
  }
  return { neededParams, existingParams };
};

export const generateRemediationFunctions = function generateRemediationFunctions( remediationValue ) { 

  return Object.fromEntries( remediationValue.map( remediation => {
    return [
      remediation.name,
      generateIdxAction(remediation),
    ]
  }) );
};


