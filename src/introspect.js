import fetch from 'cross-fetch';

export const introspect = async function introspect({ domain, stateHandle }) {
  if( !stateHandle ) {
    return Promise.reject({ error: 'stateHandle is required' });
  }

  if( !domain ) {
    return Promise.reject({ error: 'domain is required' });
  }

  const target = `${domain}/idp/idx/introspect`;
  return fetch(target, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ stateToken: stateHandle })
  })
    .then( response => response.ok ? response.json() : Promise.reject( response ) );
};


