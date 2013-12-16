# Preservative
[![Build Status](https://secure.travis-ci.org/clux/preservative.png)](http://travis-ci.org/clux/preservative)
[![Dependency Status](https://david-dm.org/clux/preservative.png)](https://david-dm.org/clux/preservative)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://nodejs.org/api/documentation.html#documentation_stability_index)

This module allows you to replay scenarios from state machines whose interface is a single class. Advantageous to serializing and saving internal state as a JSON blob because not only do you get full revision history, but also *append-only* history which is nice for replication.

## Usage
Attach a state machine of your choice, and pass in the operations that changes the state of the class. Here we use [duel](https://npmjs.org/package/duel) tournaments as a reference state machine class.

```js
var PreservedDuel = require('preservative')(require('duel'), {
  new: ['size', 'opts'],          // need to remember constructor arguments
  score: ['id', 'score', 'past']  // and every score call
});

var duel = new PreservedDuel(8); // 8 player duel tournament
duel.score(duel.matches[0].id, [1,0]); // use duel API
duel.score(duel.matches[1].id, [1,2]); // use duel API

var preserve = duel.preserve();
preserve;
[ { type: 'new', size: 8, opts: undefined },
  { type: 'score', id: { s: 1, r: 1, m: 1 }, score: [ 1, 0 ], past: undefined },
  { type: 'score', id: { s: 1, r: 1, m: 2 }, score: [ 1, 2 ], past: undefined } ]

var duel = PreservedDuel.from(preserve); // same as original duel before .preserve();
```

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
