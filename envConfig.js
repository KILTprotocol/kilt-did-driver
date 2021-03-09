const dotenv = require('dotenv');

const configOutput = dotenv.config();
if (configOutput.error) {
  throw configOutput.error;
}
