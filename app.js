// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;
let Botmetrics = require('botmetrics');
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

const NAME_ACTION = 'make_name';
const WELCOME_ACTION = 'input.welcome';
const COLOR_ARGUMENT = 'color';
const NUMBER_ARGUMENT = 'number';

// [START SillyNameMaker]
app.post('/', function (req, res) {
  const assistant = new Assistant({request: req, response: res});
  console.log('Request body: ' + JSON.stringify(req.body));

  // Make a silly name
  function makeName (assistant) {
    let number = assistant.getArgument(NUMBER_ARGUMENT);
    let color = assistant.getArgument(COLOR_ARGUMENT);
    // If we set up webhooks for slot filling
    // we need to make sure that we respond only
    // with the results if both slots are filled
    if(number && color) {
      let response = 'Alright, your silly name is ' +
        color + ' ' + number +
        '! I hope you like it. See you next time.';

      // Set Bot answer to request body
      req.body.result.fulfillment.speech = response
      assistant.tell(response);
    }

    Botmetrics.track(req.body, function(err, response) {
      console.log("botmetrics error", err);
    });
  }

  //You should make handlers for all intents even if some of them are handling by api.ai
  //This needed for tracking
  function welcome (assistant) {
    Botmetrics.track(req.body, function(err, response) {
      console.log("botmetrics error", err);
    });
  }

  let actionMap = new Map();
  actionMap.set(NAME_ACTION, makeName);
  actionMap.set(WELCOME_ACTION, welcome);

  assistant.handleRequest(actionMap);
});
// [END SillyNameMaker]

if (module === require.main) {
  // [START server]
  // Start the server
  let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}

module.exports = app;
