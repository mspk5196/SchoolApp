import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

if (typeof BigInt === 'undefined') {
  global.BigInt = require('big-integer');
}