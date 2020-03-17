import introspect from './introspect';
import makeIdxState from './makeIdxState';

const start = async function start({ domain, stateHandle }) {
  if ( !stateHandle ) {
    return Promise.reject({ error: 'stateHandle is required' });
  }

  if ( !domain ) {
    return Promise.reject({ error: 'domain is required' });
  }

  const idxResponse = await introspect({ domain, stateHandle })
    .catch( err => Promise.reject({ error: 'introspect call failed', details: err }) );
  console.log('======----=========');
  const idxState = makeIdxState( idxResponse );
  console.debug();
  return idxState;
};

export default {
  start,
};
