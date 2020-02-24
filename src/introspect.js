import fetch from 'cross-fetch';

const introspect = async function introspect({ domain, stateHandle }) {
  const target = `${domain}/idp/idx/introspect`;
  return fetch(target, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ stateToken: stateHandle })
  })
    .then( response => response.ok ? response.json() : response.json().then( err => Promise.reject(err)) );
};

export default introspect;
