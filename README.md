# okta-idx-js
Okta IDX API consumption layer for Javascript

Though focused on browser-based interactions, it should also be usable on the server-side, albeit for limited interactions.

This library is intended to ease JS-based integration with the Okta Identity Engine (OIE).  This library wraps the sequence of calls to the Okta IDX endpoints so that the consumer doesn't have to parse the entirety of each response, nor manage XHR calls.

Though this library exposes the metadata needed to generate a UI to gather needed data and select between available options, the consumer is responsible for interpeting and aacting on that metadata - idx-js is focused on sending passed data to the appropriate endpoint for the selected actions only.

## Installation

```
npm install @okta/okta-idx-js
```
or
```
yarn install @okta/okta-idx-js
```

idx-js is compatible with node 12+

## Usage

idx-js uses ES module syntax:

```
import idx from `@okta/okta-idx-js`;
```

### Initialization

`idx.start()` is passed a config object and returns a promise that resolves to an `idxState` object.

The config object params:
- **domain**: (required) The protocol+domain (but no path!) of the Okta issuer domain
- **stateHandle**: (required TODO: Until Bootstrap) The current stateHandle string

`idx.start()` is called anytime you don't have an idxState object (such as after a browser full-page redirect) and will resume any OIE flow in-progress based on the `stateHandle`

```
let idxState;
try { 
  idxState = await idx.start({ domain, stateHandle });
  // idxState has properties and methods
} catch (err) { 
  // err.error has an error message
}
```

### General Usage

The happy path for idx-js is
- Calling `idx.start()` initially to get an `idxState`
- Inspecting the `idxState.neededToProceed` array to see what data to send
  - use the `idxState.context` object for any additional information to display
- Collect the data from the user (generating a UI is outside the scope of idx-js)
- Pass the collected data to `idxState.proceed('name of remediation', dataObject)`
- The returned promise resolves to a new `idxState` object
- Continue this loop until `idxState.context.success` is populated 

The less-than-happy paths include these options:
- Canceling the flow: Actions that don't result in a new (usable) idxState are collected into an object of functions, `idxState.actions`
- Redirecting to an IDP: These redirects need to be done as full-page redirects and are not done inside of idx-js.  
  - The redirections will have `name: 'redirect'` in the `idxState.neededToProceed` array
  - A redirection entry will have additional metadata in the `.relatesTo` property.
  - Any redirection entries will contain the `.href` to redirect the page to
- WebAuthN: TODO
- Errors: TODO
- Something complicated: `idxState.rawIdxResponse` gives you access to the uninterpreted response 

### idxState Methods and Properties

#### idxState.proceed(remedationChoice, params)

`proceed()` is called to move forward to the next step of authentication.

`proceed()` returns a promise that resolves to a new idxState.
- `remediationChoice` is the name of the corresponding entry in `neededToProceed` (note that any actions that can't be called with `proceed`, such as full-page redirects, are not valid remediationChoices)
- `params` is an object of key/value pairs for data (matching the list in `neededToProceed` Ion entry)

#### idxState.neededToProceed

`neededToProceed` is an array of objects, with each object having:
- a `.name` property that will be used as a `remediationChoice` for calling `proceed()`
- a `.value` property that is an array of Ion-based descriptions of the values to pass to `proceed()`
- Other properties may be internal or dropped in later iterations (TODO: Confirm and implement)

#### idxState.context

`context` is an object of any metadata values about the current state of the IDX request and/or potential remediations.  Possible properties within this object include:
- `expiresAt` - When the current stateHandle expires
- `step` - What step in the OIE flow the request is currently at (TODO: Where is this documented?)
- `intent` - The intent of the step in the OIE flow (TODO: Where is this documented?)
- `user` - Information about the user currently in the flow
- `stateHandle` - The current stateHandle value
- `version` - What version of the IDX API in use (TODO: Confirm after Versioning discussions)
- `factor` - Information about the current factor being used for authentication
- `terminal` - Any terminal errors (TODO: Confirm still correct)
- `messages` - Any message information (TODO: Confirm still correct)
- `success` - The result information for a successful flow

#### idxState.actions

`actions` is an object of functions that do not return a new idxState, but can still be called as background (XHR) requests.  Potential actions include:
- `actions.cancel()` - Cancels the current authentication flow
- actions involving factor resets (e.g. forgotten passwords)
- actions involving WebAuthN interactions (TODO: Confirm flows)

#### idxState.rawIdxResponse

`rawIdxResponse` is an object containing the raw Ion response.  It is included to cover the uncommon cases that idx-js doesn't serve well, but the goal is to minimize the need and use of it, as any useful information should be more easily obtained in `.neededToProceed`, `.actions`, or `.context`.

## Contributing

### Running tests

Create a `.env` file with the below or set the same environment variables: 
```
ISSUER_URL=https://{yourOktaDomain}
CLIENT_ID={clientId}
REDIRECT_URI=http://localhost:8080/implicit/callback
USER_IDENTIFIER={userEmailAddress}
```


