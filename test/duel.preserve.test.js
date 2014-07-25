var Duel = require('duel')
  , location = process.env.PRESERVATIVE_COV ? '../preservative-cov.js' : '../'
  , preservative = require(location);

exports.duel = function (t) {
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

  t.done();
};

exports.noopFilter = function (t) {
  var PDuel1 = preservative(Duel, ['new', 'score']);
  var d1 = new PDuel1(4, { last: 2 });
  // failed scores should get saved, and attempted
  t.ok(!d1.score(d1.matches[d1.matches.length-1].id, [1,0]), 'score failed');
  t.equal(d1.preserve().length, 2, 'both ops saved');

  var PDuel2 = preservative(Duel, ['new', 'score'], { filterNoops: true });
  var d2 = new PDuel2(4, { last: 2 });
  // failed scores should not get saved, but attempted only
  t.ok(!d2.score(d2.matches[d2.matches.length-1].id, [1,0]), 'score failed');
  t.equal(d2.preserve().length, 1, 'only new op saved');

  t.deepEqual(PDuel2.from(d2.preserve()).matches,
    PDuel1.from(d1.preserve()).matches,
    "matches in recreated equal still"
  );
  t.done();
};
