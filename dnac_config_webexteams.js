//
// Copyright (c) 2016 Cisco Systems
// Licensed under the MIT License
//

/*
 * a Cisco Spark bot that:
 *   - sends a welcome message as he joins a room,
 *   - answers to a /hello command, and greets the user that chatted him
 *   - supports /help and a fallback helper message
 *
 * + leverages the "node-sparkclient" library for Bot to Cisco Spark communications.
 *
 */
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var request = require('request');
var SparkBot = require("node-sparkbot");
var bot = new SparkBot();
//bot.interpreter.prefix = "#"; // Remove comment to overlad default / prefix to identify bot commands

var SparkAPIWrapper = require("node-sparkclient");
if (!process.env.SPARK_TOKEN) {
    console.log("Could not start as this bot requires a Cisco Spark API access token.");
    console.log("Please add env variable SPARK_TOKEN on the command line");
    console.log("Example: ");
    console.log("> SPARK_TOKEN=XXXXXXXXXXXX DEBUG=sparkbot* node helloworld.js");
    process.exit(1);
}
var spark = new SparkAPIWrapper(process.env.SPARK_TOKEN);


//
// Help and fallback commands
//
bot.onCommand("list", function (command) {


  var request = require('request');
  var options = { method: 'POST',
    url: 'https://10.10.70.8:443/api/system/v1/auth/token',
    headers: { Authorization: 'Basic bGV2aWtlOkFQSWdvMTIz' } };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var token = JSON.parse(body);
    var token = token.Token;
    //console.log(token);
    var options2 = { method: 'GET',
      url: 'https://10.10.70.8:443/api/v1/network-device/',
      headers: { 'x-auth-token': token }}

    request(options2, function (error, response, body) {
      if (error) throw new Error(error);
    //  console.log(body);
      var body = JSON.parse(body);



        if (command.args[0] == "totalnumber") {spark.createMessage(command.message.roomId, "Number of DNA managed devices: " + body.response.length + "\n\n " , { "markdown":true }, function(err, message) {

              if (err) {
                  console.log("WARNING: could not post message to room: " + command.message.roomId);
                  return;
              }
          })};


                  if (command.args[0] == "details") {
                    var x = body.response.length;
                    for (var i = 0; i < x; i++) {
                      var bodyjson = JSON.stringify(body.response[i]);
                    spark.createMessage(command.message.roomId, "Details: \n\n" + bodyjson + "\n\n " , { "markdown":true }, function(err, message) {

                        if (err) {
                            console.log("WARNING: could not post message to room: " + command.message.roomId);
                            return;
                        }
                    })}};

                    if (command.args[0] == "serials") {
                        for (var i = 0; i < body.response.length; i++) {

                      spark.createMessage(command.message.roomId, "Serial Numbers : " + body.response[i].serialNumber + "\n\n " , { "markdown":true }, function(err, message) {

                          if (err) {
                              console.log("WARNING: could not post message to room: " + command.message.roomId);
                              return;
                          }
                      })}}



    });

  });
  //dna();
  //console.log(dna);



});



bot.onCommand("help", function (command) {
    spark.createMessage(command.message.roomId, "**commands :** \n\n **/list totalnumber** - total number of devices\n\n **/list serials ** - **Serial number of the devices \n\n**/list details** -  All the details", { "markdown":true }, function(err, message) {
        if (err) {
            console.log("WARNING: could not post message to room: " + command.message.roomId);
            return;
        }
    });
});



//bot.onCommand("fallback", function (command) {
//    spark.createMessage(command.message.roomId, "Ezt a parancsot nem ismerem,\n\n próbáld a /help parancsot.", { "markdown":true }, function(err, response) {
//        if (err) {
//            console.log("WARNING: could not post Fallback message to room: " + command.message.roomId);
//            return;
//        }
//    });
//});



//
// Welcome message
// sent as the bot is added to a Room
//
bot.onEvent("memberships", "created", function (trigger) {
    var newMembership = trigger.data; // see specs here: https://developer.ciscospark.com/endpoint-memberships-get.html
    if (newMembership.personId != bot.interpreter.person.id) {
        // ignoring
        console.log("new membership fired, but it is not us being added to a room. Ignoring...");
        return;
    }

    // so happy to join
    console.log("bot's just added to room: " + trigger.data.roomId);

    spark.createMessage(trigger.data.roomId, "Hello! Én Barbi csevegő robot vagyok!\n\nÍrd be hogy /help és segítek!", { "markdown":true }, function(err, message) {
        if (err) {
            console.log("WARNING: could not post Hello message to room: " + trigger.data.roomId);
            return;
        }

        if (message.roomType == "group") {
            spark.createMessage(trigger.data.roomId, "**Ez egy 'Csoport' szoba. Csak akkor válaszolok ha említetek! (@Barbi).**", { "markdown":true }, function(err, message) {
                if (err) {
                    console.log("WARNING: could not post Mention message to room: " + trigger.data.roomId);
                    return;
                }
            });
        }
    });
});
