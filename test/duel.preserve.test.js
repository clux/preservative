var test = require('tap').test
  , Duel = require('duel')
  , preservative = require('../');

test("recreating duel tournament", function (t) {
  var PDuel = preservative(Duel, ['new', 'score']);
  var duel = new PDuel(8);
  t.equal(duel.preserve().length, 1, '1 op');
  duel.matches.forEach(function (m) {
    var scr = m.p[0] < m.p[1] ? [2,0] : [0,2];
    duel.score(m.id, scr);
    t.deepEqual(duel.findMatch(m.id).m, scr, 'm.m updated');
  });

  var preserve = duel.preserve();
  t.equal(preserve.length, duel.matches.length + 1, 'save opts + new');

  var duel2 = PDuel.from(preserve);

  t.deepEqual(preserve, duel2.preserve(), 're-serialize works');
  //t.deepEqual(duel2.matches, duel.matches, 'matches the same');

  t.equal(duel2.numPlayers, 8, 'have getters for vars on instance');
  t.equal(duel.isDone(), true, 'have methods that redirect to inner instance');

  t.end();
});
