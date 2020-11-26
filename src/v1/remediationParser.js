import generateIdxAction from './generateIdxAction';

export const generateRemediationFunctions = function generateRemediationFunctions( remediationValue, toPersist={} ) {

  return Object.fromEntries( remediationValue.map( remediation => {
    return [
      remediation.name,
      generateIdxAction(remediation, toPersist),
    ];
  }) );
};
