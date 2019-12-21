const fieldIsAutoSent = function( field ) {
  if(!field.visible && field.value) {
    return true;
  }
  return false;
};

const divideSingleActionParams = function divideSingleActionParams( action ) {
  const neededParamsForAction = [];
  const existingParamsForAction = {};

  for( let field of action.value ) {
    if( fieldIsAutoSent( field ) ) {
      existingParamsForAction[field.name] = field.value ?? '';
    } else {
      neededParamsForAction.push(field);
    }
  }

  return { neededParamsForAction, existingParamsForAction };
};

export const divideActionParamsByAutoStatus = function divideActionParamsByAutoStatus( actionList ) {
  actionList = Array.isArray(actionList) ? actionList : [ actionList ];
  const neededParams = {};
  const existingParams = {};

  for( let action of actionList ) {
    const { neededParamsForAction, existingParamsForAction } = divideSingleActionParams(action);
    neededParams[action.name] = neededParamsForAction;
    existingParams[action.name] = existingParamsForAction;
  }

  return { neededParams, existingParams };
};

