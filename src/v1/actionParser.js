const isFieldMutable = function isFieldMutable(field) {
  // mutable defaults to true, annoyingly
  return ( field.mutable !== false );
};

const divideSingleActionParamsByMutability = function divideSingleActionParamsByMutability( action ) {
  const defaultParamsForAction = {}; // mutable and present
  const neededParamsForAction = []; // mutable values
  const immutableParamsForAction = {}; // immutable
  // TODO: remove assumption that form names are unique, neededParams being an array is a temp fix
  // not all actions have value (e.g. redirect)
  // making sure they are not empty and instead hold the remediation object
  if (!action.value) {
    neededParamsForAction.push(action);
    return { defaultParamsForAction, neededParamsForAction, immutableParamsForAction };
  }

  for ( let field of action.value ) {

    if ( isFieldMutable( field ) ) {

      neededParamsForAction.push(field);

      if ( field.value ?? false ) {
        defaultParamsForAction[field.name] = field.value;
      }

    } else {
      immutableParamsForAction[field.name] = field.value ?? '';
    }
  }
  return { defaultParamsForAction, neededParamsForAction, immutableParamsForAction };
};

export const divideActionParamsByMutability = function divideActionParamsByMutability( actionList ) {
  // TODO: when removing form name is unique assumption, this may all be redundant
  actionList = Array.isArray(actionList) ? actionList : [ actionList ];
  const neededParams = [];
  const defaultParams = {};
  const immutableParams = {};

  for ( let action of actionList ) {
    const { defaultParamsForAction, neededParamsForAction, immutableParamsForAction } = divideSingleActionParamsByMutability(action);
    neededParams.push(neededParamsForAction);
    defaultParams[action.name] = defaultParamsForAction;
    immutableParams[action.name] = immutableParamsForAction;
  }

  return { defaultParams, neededParams, immutableParams };
};

