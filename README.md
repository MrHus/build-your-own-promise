# About

This presentation / project attempts to demystify Promises by showing
how they work in a visual manner, and shows how to implement Promises
yourself.

Note: the promise implementation is not production ready. It also
does not claim to fully support the specs:

https://promisesaplus.com/

This application is split in two: `promise-ide` and `build-your-own`.

The `promise-ide` folder contains a React application to visually see how 
promises work with examples, with a nice code editor to manipulate
the examples in realtime.

The `build-your-own` folder contains a promise implementation
and the tests to check if the implementation works. To start
building promises yourself simply clear the `promise.js` file
and start building.

# Prerequisites

This project has been tested on Node.js `8.11.3` with NPM: `5.6.0`.

# Installation

Run `npm install` in both the `promise-ide` and `build-your-own` folder.

# Starting

Before running the commands make sure that you are in the correct
sub application folder.

## build-your-own

Run `npm start` to start jest interactively. The test will run
each time you save the `promise.js` file. 

Run `npm test` to run jest with code coverage. The coverage will
be written to the `/coverage` directory.

## promise-ide

Run `npm start` to start the IDE, it will start the IDE on `http://localhost:3000/`.