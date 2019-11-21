import idx, {foo} from '../../dist/idx';

describe('idx-js', () => { 
  it('loads', async () => { 
    const stateHandle = 'FAKE_STATE_HANDLE';
    const idxState = await idx.start(stateHandle);
    return expect(idxState).toBeDefined();
  });
});

