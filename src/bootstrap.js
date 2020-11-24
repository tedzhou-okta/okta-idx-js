import fetch from 'cross-fetch';

const bootstrap = async function bootstrap({ clientId, issuer, scopes = ['openid profile'] }) {
  // FIXME: default scope
  const scope = scopes.join(' ');

  const target = `${issuer}/v1/interact`; // FIXME: We should pass issuer instead of domain, and pull domain out for idx endpoints
  return fetch(target, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded', // FIXME: Do we send a version-based accept header?
    },
    body: `client_id=${encodeURIComponent(clientId)}&${encodeURIComponent(scope)}`,
  })
    .then( response => response.ok ? response.json() : response.json().then( err => Promise.reject(err)) )
    .then( data => data.interaction_handle);
};

export default bootstrap;
