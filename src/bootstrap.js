import fetch from 'cross-fetch';
   
const parseAndReject = response =>  response.json().then( err => Promise.reject(err));

const bootstrap = async function bootstrap({ clientId, issuer, scopes = ['openid', 'email'], redirectUri, codeChallenge, state }) {

  const target = `${issuer}/v1/interact`; 
  const body = Object.entries({ 
    client_id: clientId,
    scope: scopes.join(' '),
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  })
  .map( ([param, value]) => `${param}=${encodeURIComponent(value)}` )
  .join('&');

  return fetch(target, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    // body: `client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(scope)}`,
    body,
  })
    .then( response => response.ok ? response.json() : parseAndReject(response) )
    .then( data => data.interaction_handle);
};

export default bootstrap;
