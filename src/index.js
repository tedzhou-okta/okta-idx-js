import introspect from './introspect';
import bootstrap from './bootstrap';
import parsersForVersion from './parsers';

const LATEST_SUPPORTED_IDX_API_VERSION = '1.0.0';

const start = async function start({
  clientId,
  domain,
  issuer,
  stateHandle,
  version,
  redirectUri,
  state,
  scopes,
  codeChallenge,
  codeChallengeMethod,
}) {

  let interactionHandle;
  const baseUrl = issuer?.indexOf('/oauth2') > 0 ? issuer : issuer + '/oauth2'; // org AS uses domain as AS, but we need the base url for calls
  const toPersist = {
    baseUrl,
    clientId,
    state,
  };

  if ( !domain && !issuer) {
    return Promise.reject({ error: 'issuer is required' });
  }

  if ( !stateHandle && !clientId ) { // redirectUri is only required on self-hosted flow
    return Promise.reject({ error: 'clientId is required' });
  }

  if ( !stateHandle && !redirectUri ) { // redirectUri is only required on self-hosted flow
    return Promise.reject({ error: 'redirectUri is required' });
  }

  if (!stateHandle && !(codeChallenge && codeChallengeMethod)) {
    return Promise.reject({ error: 'PKCE params (codeChallenge, codeChallengeMethod) are required' });
  }

  if ( !domain ) {
    domain = new URL(issuer).origin;
  }

  if ( !version ) {
    return Promise.reject({ error: 'version is required' });
  }

  const cleanVersion = (version ?? '').replace(/[^0-9a-zA-Z._-]/, '');
  if ( cleanVersion !== version || !version ) {
    return Promise.reject({ error: 'invalid version supplied - version is required and uses semver syntax'});
  }

  if ( !stateHandle ) { // customer-hosted
    try {
      const bootstrapParams = {
        clientId,
        baseUrl,
        scopes,
        redirectUri,
        codeChallenge,
        codeChallengeMethod,
        state
      };

      const interaction_handle = await bootstrap( bootstrapParams );
      interactionHandle = interaction_handle;
      toPersist.interactionHandle = interactionHandle;
    } catch (error) {
      return Promise.reject({ error });
    }
  }

  try {
    const { makeIdxState } = parsersForVersion(version);
    const idxResponse = await introspect({ domain, interactionHandle, stateHandle, version })
      .catch( err => Promise.reject({ error: 'introspect call failed', details: err }) );
    const idxState = makeIdxState( idxResponse, toPersist );
    return idxState;
  } catch (error) {
    return Promise.reject({ error });
  }
};

export default {
  start,
  LATEST_SUPPORTED_IDX_API_VERSION,
};
