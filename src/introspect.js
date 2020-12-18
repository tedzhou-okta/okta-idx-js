import fetch from 'cross-fetch';
import { userAgentHeaders } from './userAgent';

const introspect = async function introspect({ domain, interactionHandle, stateHandle, version }) {

  const target = `${domain}/idp/idx/introspect`;
  const body = stateHandle ? { stateToken: stateHandle } : { interactionHandle };
  return fetch(target, {
    method: 'POST',
    headers: {
      ...userAgentHeaders(),
      'content-type': `application/ion+json; okta-version=${version}`, // Server wants this version info
      accept: `application/ion+json; okta-version=${version}`,
    },
    body: JSON.stringify(body)
  })
    .then( response => {
      if (response.ok) {
        return response.json();
      }
      return response.json().then( err => {
        if (err.version) { // assumed idx response
          return err; // http errors with idx responses are not rejected
        }
        return Promise.reject(err);
      });
    });
};

export default introspect;
