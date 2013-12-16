var test = require('tap').test
  , preservative = require('../');

test("recreating duel tournament", function (t) {
  var PreservedDuel = preservative(require('duel'), {
    new: ['size', 'opts'],
    score: ['id', 'score', 'past']
  });

  var duel = new PreservedDuel(8);
  duel.matches.forEach(function (m) {
    duel.score(m.id, m.p[0] < m.p[1] ? [2,0] : [0,2]);
  });
  var preserve = duel.preserve();

  var duel2 = PreservedDuel.from(preserve);

  t.deepEqual(preserve, duel2.preserve(), 're-serialize works');
  t.deepEqual(duel2.matches, duel.matches, 'matches the same');

  t.equal(duel2.numPlayers, 8, 'have getters for vars on instance');
  t.equal(duel.isDone(), true, 'have methods that redirect to inner instance');

  t.end();
});
