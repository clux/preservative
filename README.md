# Preservative
[![npm status](http://img.shields.io/npm/v/preservative.svg)](https://www.npmjs.org/package/preservative)
[![build status](https://secure.travis-ci.org/clux/preservative.svg)](http://travis-ci.org/clux/preservative)
[![dependency status](https://david-dm.org/clux/preservative.svg)](https://david-dm.org/clux/preservative)
[![coverage status](http://img.shields.io/coveralls/clux/preservative.svg)](https://coveralls.io/r/clux/preservative)
[![experimental](http://img.shields.io/badge/stability-experimental-DD5F0A.svg)](http://nodejs.org/api/documentation.html#documentation_stability_index)

This module allows you to replay scenarios from state machines whose interface is a single class. Advantageous to serializing and saving internal state as a JSON blob because not only do you get full revision history, but also *append-only* history which is nice for replication.

## Usage
Attach a state machine of your choice, and pass in the operations that changes the state of the class. Here we use [duel](https://npmjs.org/package/duel) tournaments as a reference state machine class.

```js
var PreservedDuel = require('preservative')(require('duel'), ['new', 'score']);

var duel = new PreservedDuel(8); // 8 player duel tournament
duel.score(duel.matches[0].id, [1,0]); // use duel API
duel.score(duel.matches[1].id, [1,2]); // use duel API

var preserve = duel.preserve();
preserve;
[ { type: 'new', args: [ 8, undefined ] },
  { type: 'score', args: [ { s: 1, r: 1, m: 1 }, [ 1, 0 ], undefined ] },
  { type: 'score', args: [ { s: 1, r: 1, m: 2 }, [ 1, 2 ], undefined ] } ]

var duel = PreservedDuel.from(preserve); // same as original duel before .preserve();
```

## Options
If the underlying state machine returns boolean whether or not the operation was allowed, preservative can filter out the calls that were disallowed.

```js
var PreservedDuel = require('preservative')(require('duel'), ['new', 'score'], { filterNoops: true });
var duel = new PreservedDuel(4);
var last = duel.matches[duel.matches.length-1];
duel.score(last.id, [1,0]); // false

duel.preserve(); // [ { type: 'new', args: [ 4, undefined ] } ]

var first = duel.matches[0]
duel.score(first.id, [1,0]); // true
duel.preserve();
[ { type: 'new', args: [ 4, undefined ] }
  { type: 'score', args: [ { s: 1, r: 1, m: 1 }, [ 1, 0 ], undefined ] } ]
```

By using `ignoreNoops`, you only get the part of history that mattered.

## Installation
Install locally from npm

```bash
$ npm install preservative --save
```

## Running tests
Install development dependencies

```bash
$ npm install
```

Run the tests

```bash
$ npm test
```

## License
MIT-Licensed. See LICENSE file for details.
