import { parseIdxResponse } from './idxResponseParser';

const isIdxResponse = function isIdxResponse( response ) { 
  // best guess
  if (typeof response !== 'object') { 
    return false;
  }
  if ( !response.stateHandle ) { 
    return false;
  }
  if ( !response.version ) { 
    return false;
  }
  if ( !response.expiresAt ) { 
    return false;
  }
  return true;
} 

const makeIdxState = function makeIdxState( idxResponse, responseMeta ) {
  const rawIdxResponse =  idxResponse;

  if (!isIdxResponse(idxResponse)) { 
    throw new Error('response was not an idxResponse');
  }

  const { remediations, context, actions } = parseIdxResponse( idxResponse );
  const neededToProceed = [...remediations];


  const proceed = async function( remediationChoice, paramsFromUser = {} ) {
    /*
    TODO: 'name' thoughts won't hold true in the future.  https://oktawiki.atlassian.net/wiki/spaces/eng/pages/1060738373/idx+API+Review#Forms
    remediationChoice is the name attribute on each form
    name should remain unique for items inside the remediation that are considered forms(identify, select-factor)
    name can be duplicate for items like redirect where its not considered a form(redirect)
    when names are not unique its a redirect to a href, so widget wont POST to idx-js layer.
    */
    const remediationChoiceObject = remediations.find((remediation) => remediation.name === remediationChoice);
    if ( !remediationChoiceObject ) {
      return Promise.reject(`Unknown remediation choice: [${remediationChoice}]`);
    }

    return remediationChoiceObject.action(paramsFromUser);
  };

  return {
    proceed,
    neededToProceed,
    actions,
    context,
    rawIdxState: rawIdxResponse,
    responseMeta,
  };
};

export default makeIdxState;
