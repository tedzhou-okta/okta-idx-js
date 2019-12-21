import generateIdxAction from './generateIdxAction';

export const generateRemediationFunctions = function generateRemediationFunctions( remediationValue ) { 

  return Object.fromEntries( remediationValue.map( remediation => {
    return [
      remediation.name,
      generateIdxAction(remediation),
    ]
  }) );
};
