import fetch from 'cross-fetch';

const makeIdxState = function({ stateHandle, idxResponse }) {
  if( !stateHandle ) { 
    return Promise.reject({ error: 'stateHandle is required' });
  }

  if( !idxResponse ) { 
    return Promise.reject({ error: 'idxResponse is required' });
  }

  const proceed = async function() {
  };
  return {
    proceed,
    _rawIdxState: idxResponse, 
  };
};

const introspect = async function introspect({ domain, stateHandle }) { 
  const target = `${domain}/idp/idx/introspect`;
  return fetch(target, { 
    method: 'POST',
    headers: { 
      'content-type': 'application/json',
    },
    body: JSON.stringify({ stateToken: stateHandle })
  })
    .then( response => response.ok ? response.json() : Promise.reject( response ) );
}


const start = async function start({ domain, stateHandle }) {
  const idxResponse = await introspect({ domain, stateHandle })
    .catch( e => console.error('introspect fail', e) );
  const idxState = makeIdxState({ stateHandle, idxResponse });
  return idxState;
};

export default {
  start,
};
