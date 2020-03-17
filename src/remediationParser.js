import generateIdxAction from './generateIdxAction';

export const generateRemediationFunctions = function generateRemediationFunctions( remediationValue ) {

  const res = Object.fromEntries( remediationValue.map( remediation => {
    return [
      remediation.name,
      generateIdxAction(remediation),
    ];
  }) );
  console.log('********generateRemediationFunctions: ', res);
  return res;
};
