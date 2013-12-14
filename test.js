var preservative = require('./');

/*
if preservative is meant to act on a class then we can't have .from
EITHER Tourney must fix this (by making complete pieces)
OR we must discard the one class meaning

the first seems easier if we can still make new Tourneys from other Tourneys and Tournaments
and we should be able to do this anyway
*/


var RevisionedDuel = preservative(require('duel'), {
  new: ['size', 'opts'],
  score: ['id', 'score', 'past']
});

var duel = new RevisionedDuel(8);
duel.score(duel.matches[0].id, [2,1]);
duel.matches.forEach(function (m) {
  duel.score(m.id, m.p[0] < m.p[1] ? [2,0] : [0,2]);
});

console.log(duel.matches, duel.results());

var state = duel.getState().map(function (o) {
  return JSON.stringify(o);
}).join('\n');

console.log(state);
