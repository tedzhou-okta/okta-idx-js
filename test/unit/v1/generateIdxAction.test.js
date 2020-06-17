import generateIdxAction from '../../../src/v1/generateIdxAction';

const mockIdxResponse = require('../../mocks/request-identifier');
const mockPollingIdxResponse = require('../../mocks/poll-for-password');

const { Response } = jest.requireActual('cross-fetch');

const deepClone = ( target ) => JSON.parse(JSON.stringify( target ));
const mockResponse = ( respondWith ) => Promise.resolve( new Response( JSON.stringify( respondWith) ) );

// import targets for mockery
import fetch from 'cross-fetch'; 
import makeIdxState from '../../../src/v1/makeIdxState';

jest.mock('cross-fetch');
/*
  Doing a jest.mock('../../src/makeIdxState') has problems with jest.mock causing the test to hang
  and spikes up the CPU usage for the current node process.
  Alternative mocking approach: https://jestjs.io/docs/en/es6-class-mocks
*/
const mockMakeIdxState = jest.fn();
jest.mock('../../../src/v1/makeIdxState', () => {
  return jest.fn().mockImplementation(() => {
    return {makeIdxState: mockMakeIdxState};
  });
});

describe('generateIdxAction', () => { 
  it('builds a function', () => {
    const actionFunction = generateIdxAction(mockIdxResponse.remediation.value[0]);
    expect(typeof actionFunction).toBe('function');
  });

  it('returns a function that returns an idxState', async () => {
    fetch.mockImplementationOnce( () => mockResponse( mockIdxResponse ));
    makeIdxState.mockReturnValue('mock IdxState');
    const actionFunction = generateIdxAction(mockIdxResponse.remediation.value[0]);
    return actionFunction()
      .then( result => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'https://dev-550580.okta.com/idp/idx/identify' );
        expect( fetch.mock.calls[0][1] ).toEqual( { 
          body: '{"stateHandle":"02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"}',
          headers: { 
            'content-type': 'application/json',
            'accepts': 'application/ion+json; okta-version=1.0.0',
          },
          method: "POST"
        });
        expect( result ).toBe('mock IdxState')
      });
  });

  it('passes idxResponse to makeIdxState even on an http error', async () => { 
    fetch.mockImplementationOnce( () => Promise.resolve( new Response(
      JSON.stringify( {'this is': 'not an idx response'} ),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )));
    const actionFunction = generateIdxAction(mockIdxResponse.remediation.value[0]);
    return actionFunction()
      .then( () => { 
        expect(makeIdxState.mock.calls.length).toBe(1);
        expect(makeIdxState.mock.calls[0][0]).toEqual({'this is': 'not an idx response'});
      });
  });

  it('sends pre-filled default field values', async () => { 
    fetch.mockImplementationOnce( () => mockResponse( mockIdxResponse ));
    makeIdxState.mockReturnValue('mock IdxState');

    const mockRemediationWithValue = deepClone(mockIdxResponse.remediation.value[0]);
    expect(mockRemediationWithValue.value[0].name).toBe('identifier');
    mockRemediationWithValue.value[0].value = "A_DEFAULT";

    const actionFunction = generateIdxAction(mockRemediationWithValue);
    return actionFunction({ })
      .catch( result => { 
        fail('mock fetch failed', result);
      })
      .then( result => { 
        expect( fetch.mock.calls[0][1] ).toEqual( { 
          body: '{"identifier":"A_DEFAULT","stateHandle":"02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"}',
          headers: {
            'content-type': 'application/json',
            'accepts': 'application/ion+json; okta-version=1.0.0',
          },
          method: "POST"
        });
      });
  });

  it('does not allow overridding immutable fields', async () => { 
    fetch.mockImplementationOnce( () => mockResponse( mockIdxResponse ));
    makeIdxState.mockReturnValue('mock IdxState');
    const mockRemediationWithImmutableValue = deepClone(mockIdxResponse.remediation.value[0]);
    expect(mockRemediationWithImmutableValue.value[1].name).toBe('stateHandle');
    expect(mockRemediationWithImmutableValue.value[1].mutable).toBe(false);

    const actionFunction = generateIdxAction(mockRemediationWithImmutableValue);
    return actionFunction({ stateHandle: 'SHOULD_NOT_CHANGE' })
      .catch( result => { 
        fail('mock fetch failed', result);
      })
      .then( result => { 
        expect( fetch.mock.calls[0][1] ).toEqual( { 
          body: '{"stateHandle":"02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"}',
          headers: {
            'content-type': 'application/json',
            'accepts': 'application/ion+json; okta-version=1.0.0',
          },
          method: "POST"
        });
      });
  });

  it('does allow overridding mutable values', async () => { 
    fetch.mockImplementationOnce( () => mockResponse( mockIdxResponse ));
    makeIdxState.mockReturnValue('mock IdxState');

    const mockRemediationWithMutableValue = JSON.parse(JSON.stringify(mockIdxResponse.remediation.value[0]));
    expect(mockRemediationWithMutableValue.value[0].name).toBe('identifier');
    expect(mockRemediationWithMutableValue.value[0].mutable).not.toBe(false);
    mockRemediationWithMutableValue.value[0].value = "SHOULD_CHANGE";

    const actionFunction = generateIdxAction(mockRemediationWithMutableValue);
    return actionFunction({ identifier: 'WAS_CHANGED' })
      .catch( result => { 
        fail('mock fetch failed', result);
      })
      .then( result => { 
        expect( fetch.mock.calls[0][1] ).toEqual( { 
          body: '{"identifier":"WAS_CHANGED","stateHandle":"02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"}',
          headers: {
            'content-type': 'application/json',
            'accepts': 'application/ion+json; okta-version=1.0.0',
          },
          method: "POST"
        });
      });
  });


  // TODO: Conditions to decide if polling is finished are being discussed
  xit('generates a polling function when appropriate', () => { 
    const pollingFunction = generateIdxAction( mockPollingIdxResponse.factor.value.poll );
    fail('not done yet');
  });
});
