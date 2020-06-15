import introspect from './introspect';
import parsersForVersion from './parsers';

const LATEST_SUPPORTED_IDX_API_VERSION = '1.0.0';

const start = async function start({ domain, stateHandle, version }) {

  if ( !stateHandle ) {
    return Promise.reject({ error: 'stateHandle is required' });
  }

  if ( !domain ) {
    return Promise.reject({ error: 'domain is required' });
  }

  if ( !version ) {
    return Promise.reject({ error: 'version is required' });
  }

  const idxResponse = await introspect({ domain, stateHandle, version })
    .catch( err => Promise.reject({ error: 'introspect call failed', details: err }) );

  try { 
    const { makeIdxState } = parsersForVersion(version);
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
