import introspect from './introspect';
import bootstrap from './bootstrap';
import parsersForVersion from './parsers';

const LATEST_SUPPORTED_IDX_API_VERSION = '1.0.0';

const start = async function start({ clientId, domain, stateHandle, version, scopes }) {
  let interactionHandle;

  if ( !domain ) {
    return Promise.reject({ error: 'domain is required' });
  }

  if ( !version ) {
    return Promise.reject({ error: 'version is required' });
  }

  const cleanVersion = (version ?? '').replace(/[^0-9a-zA-Z._-]/, '');
  if ( cleanVersion !== version || !version ) {
    return Promise.reject({ error: 'invalid version supplied - version is required and uses semver syntax'});
  }

  if ( !stateHandle && !clientId ) {
    return Promise.reject({ error: 'clientId is required when there is no stateHandle' });
  }

  if ( !stateHandle ) {
    try {
      const { interaction_handle } = await bootstrap({ clientId, domain, version, scope });
      interactionHandle = interaction_handle;
    } catch (error) {
      return Promise.reject({ error });
    }
  }

  try {
    const { makeIdxState } = parsersForVersion(version);
    const idxResponse = await introspect({ domain, interactionHandle, stateHandle, version })
      .catch( err => Promise.reject({ error: 'introspect call failed', details: err }) );
    const idxState = makeIdxState( idxResponse );
    return idxState;
  } catch (error) {
    return Promise.reject({ error });
  }
};

export default {
  start,
  LATEST_SUPPORTED_IDX_API_VERSION,
};
