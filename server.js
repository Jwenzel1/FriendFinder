var express = require("express");
var bodyParser = require("body-parser");
var path = require("path");
var fs = require("fs");
var apiRoutes = require("./app/routing/apiRoutes.js");
var htmlRoutes = require("./app/routing/htmlRoutes.js");

var app = express();
var PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

app.get(htmlRoutes.home, function(req, res) {
  res.sendFile(path.join(__dirname, "./app/public/home.html"));
});

app.get(htmlRoutes.survey, function(req, res) {
  res.sendFile(path.join(__dirname, "./app/public/survey.html"));
});

app.get(apiRoutes.friends, function(req, res) {
  var friends = JSON.parse(fs.readFileSync("./app/data/friends.js", "utf8"));
  res.json(friends);
});

app.post(apiRoutes.computeCompatibility, function(req, res){
  var friends = JSON.parse(fs.readFileSync("./app/data/friends.js", "utf8"));
  var usersTotal = 0;
  var bestFriend = friends[0];
  var needToAdd = true;

  for(var i = 0; i < req.body.scores.length; i++){ //Calc the score of the submitted data
    usersTotal += parseInt(req.body.scores[i]);
  }

  for(friend of friends){ //Compare the users score to that of all potential friends and pick the one with difference closest to 0;
    if(Math.abs(usersTotal - friend.total) < Math.abs(usersTotal - bestFriend.total)){
      bestFriend = friend;
    }
    if(friend.name == req.body.name){
      needToAdd = false;
    }
  }

  if(needToAdd){
    req.body.total = usersTotal;
    friends.push(req.body);
    fs.writeFile("./app/data/friends.js");
  }

  bestFriend = {name: bestFriend.name, image: bestFriend.photo};
  res.json(bestFriend);
});


// Starts the server to begin listening
// =============================================================
app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});
