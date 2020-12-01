import fetch from 'cross-fetch';

const parseAndReject = response =>  response.json().then( err => Promise.reject(err));

export const exchangeCodeForTokens = function exchangeCodeForTokens({ interactionCode, clientId, issuer, codeVerifier }) {
  const tokenUrl = `${issuer}/v1/token`;
  const body = Object.entries({
    client_id: clientId,
    code_verifier: codeVerifier,
    grant_type: 'interaction_code',
    interaction_code: interactionCode,
  })
    .map( ([param, value]) => `${param}=${encodeURIComponent(value)}` )
    .join('&');

  return fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  })
    .then( response => response.ok ? response.json() : parseAndReject(response) );

};
