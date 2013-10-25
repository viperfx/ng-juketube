# ng-JukeBox - A Youtube Powered JukeBox built with AngularJS, nodejs and Socket.IO

## What is it?
It is a realtime web app that lets you play music from youtube on a host computer (a client that creates a room) and the features of the app such as adding to the playlist, rearranging the playlist, music controls such as play/pause and next are all controllable through guests (a client that joins a room). All the UI and data is updated in realtime for all clients connected their respective rooms thanks to WebSockets and SocketIO.

## Screenshots
![JukeBox](http://cl.ly/image/1l1Z0i3u1D2W/Screen%20Shot%202013-10-25%20at%2014.16.00.png)

## Demo
[ng-JukeBox on Heroku](http://ng-jukebox.herokuapp.com/)

## Credit
The initial work and insipiration came from @jgthms. You can see his AngularJS app [here](https://github.com/jgthms/juketube). Although my version has changed a lot both in functionality and design it is still an extension on his work.

[Angular Mobile Frame](https://github.com/herschel666/angular-mobile-frame) is useful library that I have utilised. It is a set of directives for making mobile friendly apps.


## Deployment
To make working with frontend frameworks easier and the eventual deployment I use [limeman](https://github.com/testdouble/heroku-buildpack-lineman). What is even more nifty is that deploying to heroku (now that they support [websockets](https://devcenter.heroku.com/articles/node-websockets) - good timing!) is really easy, much easier than I first thought.

You simply make sure all the dependancies of lineman are present in your package.json and then add a postscript command in the file so that you can use lineman to build your angularjs app on heroku. More info [here](http://stackoverflow.com/questions/13784600/how-to-deploy-node-app-that-uses-grunt-to-heroku)
```
  "scripts": {
    "postinstall": "lineman build"
  },
```

