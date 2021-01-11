/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5001',
  // apiUrl: 'http://coo-dev.fushan.fihnbb.com/api',
  // apiUrl: 'http://coo-dev.fushan.fihnbb.com',
  ADWeb_URI: 'http://idmgt.fushan.fihnbb.com',
  CLIENT_ID: 'iFFnnowtaBIY1VuODou5osotxFMducIU',
  CLIENT_SECRET: 'z9UdDTdTXpzfXcHwEHgp00yBjRZExspk',
  // CLIENT_REDIRECT_URL: 'http://coo-dev.fushan.fihnbb.com/Login/Success',
  CLIENT_REDIRECT_URL: 'http://localhost:44400/Login/Success',
};