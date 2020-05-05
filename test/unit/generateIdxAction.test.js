import generateIdxAction from '../../src/generateIdxAction';

const mockIdxResponse = require('../mocks/request-identifier');
const mockPollingIdxResponse = require('../mocks/poll-for-password');

const { Response } = jest.requireActual('cross-fetch');

// import targets for mockery
import fetch from 'cross-fetch'; 
import makeIdxState from '../../src/makeIdxState';

jest.mock('cross-fetch');
/*
  Doing a jest.mock('../../src/makeIdxState') has problems with jest.mock causing the test to hang
  and spikes up the CPU usage for the current node process.
  Alternative mocking approach: https://jestjs.io/docs/en/es6-class-mocks
*/
const mockMakeIdxState = jest.fn();
jest.mock('../../src/makeIdxState', () => {
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
    fetch.mockImplementationOnce( () => Promise.resolve( new Response(JSON.stringify( mockIdxResponse )) ) );
    makeIdxState.mockReturnValue('mock IdxState');
    const actionFunction = generateIdxAction(mockIdxResponse.remediation.value[0]);
    return actionFunction()
      .then( result => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'https://dev-550580.okta.com/idp/idx/identify' );
        expect( fetch.mock.calls[0][1] ).toEqual( { 
          body: '{"stateHandle":"02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"}',
          headers: { 
            'content-type': 'application/vnd.okta.v1+json',
          },
          method: "POST"
        });
        expect( result ).toBe('mock IdxState')
      });
  });

  it('returns a function that returns an idxState', async () => {
    fetch.mockImplementationOnce( () => Promise.resolve( new Response(
      JSON.stringify( mockIdxResponse ),
      { status: 401, headers: { 'content-type': 'application/json', 'WWW-Authenticate': 'Oktadevicejwt realm="Okta Device"' } }
    )));
    makeIdxState.mockReturnValue('mock IdxState');
    const actionFunction = generateIdxAction(mockIdxResponse.remediation.value[0]);
    return actionFunction()
      .catch( result => {
        expect( fetch.mock.calls.length ).toBe(1);
        expect( fetch.mock.calls[0][0] ).toEqual( 'https://dev-550580.okta.com/idp/idx/identify' );
        expect( fetch.mock.calls[0][1] ).toEqual( {
          body: '{"stateHandle":"02Yi84bXNZ3STdPKisJIV0vQ7pY4hkyFHs6a9c12Fw"}',
          headers: {
            'content-type': 'application/vnd.okta.v1+json',
          },
          method: "POST"
        });
        expect( result ).toBe('mock IdxState')
      });
  });

  // TODO: Conditions to decide if polling is finished are being discussed
  xit('generates a polling function when appropriate', () => { 
    const pollingFunction = generateIdxAction( mockPollingIdxResponse.factor.value.poll );
    fail('not done yet');
  });
});
