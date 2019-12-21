import fetch from 'cross-fetch';

const generateDirectFetch = function generateDirectFetch( actionDefinition ) { 
  const target = actionDefinition.href;
  return async function (params) {
    return fetch(target, {
      method: actionDefinition.method,
      headers: {
        'content-type': actionDefinition.accepts,
      },
      body: JSON.stringify( params )
    })
      .then( response => response.ok ? response.json() : Promise.reject( response ) );
  };
};

const generatePollingFetch = function generatePollingFetch( actionDefinition ) { 
  // TODO: Discussions ongoing about when to terminate polling
  const target = actionDefinition.href;
  return async function (params) {
    return fetch(target, {
      method: actionDefinition.method,
      headers: {
        'content-type': actionDefinition.accepts,
      },
      body: JSON.stringify( params )
    })
      .then( response => response.ok ? response.json() : Promise.reject( response ) );
  };
};

const generateIdxAction = function generateIdxAction( actionDefinition ) {
  const generator =  actionDefinition.refresh ? generateDirectFetch : generatePollingFetch;
  return generator(actionDefinition);
};

export default generateIdxAction;
