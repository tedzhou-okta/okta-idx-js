# okta-idx-js

Okta IDX API consumption layer for Javascript

The use of this SDK requires usage of the Okta Identity Engine. This functionality is in general availability but is being gradually rolled out to customers. If you want to request to gain access to the Okta Identity Engine, please reach out to your account manager. If you do not have an account manager, please reach out to oie@okta.com for more information.

Currently focused on browser-based interactions, but server-side functionality is expected soon.

This library is intended to ease JS-based integration with the Okta Identity Engine (OIE) making use if the Okta Identity Experience (IDX) API.  This library wraps the sequence of calls to the Okta IDX endpoints so that the consumer doesn't have to parse the entirety of each response, nor manage XHR calls.

Though this library exposes the metadata needed to generate a UI to gather needed data and select between available options, the consumer is responsible for interpeting and acting on that metadata - idx-js is focused on sending passed data to the appropriate endpoint for the selected actions only.

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

Configuration params:

- **clientId**: (required) Client Id pre-registered with Okta for the OIDC authentication flow.
- **issuer**: (required) The protocol+domain+path of the Okta issuer domain (Authorization Server).
- **redirectUri**: (required) The url that is redirected to after authentication. This must be pre-registered as part of client registration in the okta application console.
- **version**: (required) The server version of the IDX api. (Example: "1.0.0")  You must specify a specific version as any change in the parsed output can have drastic impact on anything relying on this library.
- **codeChallenge**: (required) A PKCE code challenge (base64UrlEncoded hash of code verifier, which is maintained outside of the idx-js library
- **codeChallengeMethod**: (required) The method used to generate the hash of the PKCE code challenge.  Per PKCE spec, this is currently 'S256'
- **scopes**: (optional) Specify what information to make available in the returned tokens by providing an array of strings with known meaning as an OIDC scope.  Defaults to ['openid', 'email'].
- **interactionHandle**: (optional) The current interactionHandle of a customer-hosted flow in-progress.  New flows will not have an existing handle and should not try to pass this value.

`idx.start()` is called anytime you don't have an idxState object (such as after a browser full-page redirect) and will resume any OIE flow in-progress based on the passed **interactionHandle** (customer-hosted)

```
let idxState;
try { 
  idxState = await idx.start({ issuer, clientId, redirectUri, version, codeChallenge, codeChallengeMethod });
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
- Continue this loop until `idxState.hasInteractionCode()` returns true
- Get an `interactionCode` from `idxState.interactionCode`
- Exchange the `interactionCode` to obtain tokens.  This is outside idx-js, but can be done with (for example) okta-auth-js `token.exchangeCodeForTokens(...)`

The less-than-happy paths include these options:
- Canceling the flow: Actions that don't result in a new (usable) idxState are collected into an object of functions, `idxState.actions`
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
- `intent` - The intent (e.g. "LOGIN") of the IDX flow
- `user` - Information about the user currently in the flow
- `stateHandle` - The current stateHandle value
- `version` - What version of the IDX API in use
- `factor` - Information about the current factor being used for authentication
- `terminal` - Any terminal errors
- `messages` - Any message information.  Note that messages that pertain to particular fields will be in the remediation structures describing those fields.
- `success` - The result information for a successful flow

#### idxState.actions

`actions` is an object of functions that do not return a new idxState, but can still be called as background (XHR) requests.  Potential actions include:
- `actions.cancel()` - Cancels the current authentication flow
- actions involving factor resets (e.g. forgotten passwords)
- actions involving WebAuthN interactions (TODO: Confirm flows)

#### idxState.hasInteractionCode()

`hasInteractionCode()` returns `true` if the flow has resulted in a final success and the idxState contains an interactionCode that can be exchanged for tokens.  Not used in the Okta-hosted flow.

#### idxState.interactionCode

`interactionCode` is the value returned at the end of a successful IDX flow.  This value can be sent to the Okta `v1/token` endpoint to be exchanged for the tokens matching the requesting scope.  The PKCE `code_verifier` used to produce the `codeChallenge` sent to `idx.start(...)` must be sent to the token endpoint as well.

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


