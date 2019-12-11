import idx from '../../dist/idx';
import dotenv from 'dotenv';

dotenv.config(); 

// Note: idx-js provides no front end UI
// Thus, rather than testing a front end UI, these are integration tests
// where no network interactions are mocked

import idxBootstrap from '../idxBootstrap';

const config = {};

beforeEach( async () => { 
  config.issuerUrl = process.env.ISSUER_URL;
  config.clientId = process.env.CLIENT_ID;
  config.redirectUri = process.env.REDIRECT_URI;
  config.stateHandle =  await idxBootstrap.getStateHandle({ ...config });
});
   
describe('idx-js', () => { 
  it('loads', async () => { 
    const stateHandle = await config.stateHandle;
    const idxState = await idx.start({ domain: config.issuerUrl, stateHandle });
    expect(idxState).toBeDefined();
  });
});


