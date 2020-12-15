import fetch from 'cross-fetch';
import { userAgentHeaders } from './userAgent';

const parseAndReject = response =>  response.json().then( err => Promise.reject(err));

const bootstrap = async function bootstrap({
  clientId,
  issuer,
  scopes = ['openid', 'email'],
  redirectUri,
  codeChallenge,
  codeChallengeMethod,
  state
}) {

  const target = `${issuer}/v1/interact`;
  const body = Object.entries({
    client_id: clientId,
    scope: scopes.join(' '),
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: codeChallengeMethod,
    state,
  })
    .map( ([param, value]) => `${param}=${encodeURIComponent(value)}` )
    .join('&');

  return fetch(target, {
    method: 'POST',
    headers: {
      ...userAgentHeaders(),
      'content-type': 'application/x-www-form-urlencoded',
    },
    body,
  })
    .then( response => response.ok ? response.json() : parseAndReject(response) )
    .then( data => data.interaction_handle);
};

export default bootstrap;
