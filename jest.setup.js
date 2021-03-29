// SDK_VERSION normally from webpack
const SDK_VERSION = require('./package.json').version;
global.SDK_VERSION = SDK_VERSION;

// crypto to mimic browser environment
import { Crypto } from '@peculiar/webcrypto';
global.crypto = new Crypto();

// TextEncoder
import { TextEncoder } from 'util';
global.TextEncoder = TextEncoder;
