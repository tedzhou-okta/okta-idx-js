const fieldIsAutoSent = function( field ) {
  if (!field.visible && field.value) {
    return true;
  }
  return false;
};

const divideSingleActionParams = function divideSingleActionParams( action ) {
  const neededParamsForAction = [];
  const existingParamsForAction = {};
  // redirect form does not have a value array
  for ( let field of action.value || [] ) {
    if ( fieldIsAutoSent( field ) ) {
      existingParamsForAction[field.name] = field.value ?? '';
    } else {
      neededParamsForAction.push(field);
    }
  }
  // making sure redirect-$.idps.value[*] is not empty and actually holds the remediation object
  if (!action.value) {
    neededParamsForAction.push(action);
  }

  return { neededParamsForAction, existingParamsForAction };
};

export const divideActionParamsByAutoStatus = function divideActionParamsByAutoStatus( actionList ) {
  actionList = Array.isArray(actionList) ? actionList : [ actionList ];
  const neededParams = [];
  const existingParams = {};

  for ( let action of actionList ) {
    const { neededParamsForAction, existingParamsForAction } = divideSingleActionParams(action);
    neededParams.push(neededParamsForAction);
    existingParams[action.name] = existingParamsForAction;
  }

  return { neededParams, existingParams };
};

