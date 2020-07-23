import fetch from 'cross-fetch';

const introspect = async function introspect({ domain, stateHandle, version }) {
  const cleanVersion = (version ?? '').replace(/[^0-9a-zA-Z._-]/, '');
  if ( cleanVersion !== version || !version ) {
    throw new Error('invalid version supplied - version is required and uses semver syntax');
  }
  const target = `${domain}/idp/idx/introspect`;
  return fetch(target, {
    method: 'POST',
    headers: {
      'content-type': `application/ion+json; okta-version=${version}`, // Server wants this version info
      accept: `application/ion+json; okta-version=${version}`,
    },
    body: JSON.stringify({ stateToken: stateHandle })
  })
    .then( response => response.ok ? response.json() : response.json().then( err => Promise.reject(err)) );
};

export default introspect;
