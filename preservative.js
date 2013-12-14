var construct = function (Ctor, args) {
  var F;
  F = function () {
    return Ctor.apply(this, args);
  };
  F.prototype = Ctor.prototype;
  return new F();
};

var stringify = function (o) {
  // TODO: throw if any method takes circulars or functions
  // inherent limitation of preservative
  return (Object(o) === o) ? JSON.stringify(o) : o + '';
};

module.exports = function (Klass, apiList) {
  function SubKlass() {
    this.state = [];
    var args = arguments;
    var o = { type: 'new' };
    apiList.new.forEach(function (arg, i) {
      o[arg] = stringify(args[i]);
    });
    this.state.push(o);

    var inst = construct(Klass, arguments);

    // TODO: try to create getters for every public property on inst
    this.inst = inst;

    // forward methods
    ['results', 'isDone', 'upcoming'].forEach(function (method) {
      this[method] = inst[method].bind(inst);
    }.bind(this));

    // forward references
    ['numPlayers', 'matches' ].forEach(function (prop) {
      Object.defineProperty(this, prop, {
        get: function () {
          return inst[prop];
        }
      });
    }.bind(this));
  }

  Object.keys(apiList).forEach(function (name) {
    var namedArgs = apiList[name];
    SubKlass.prototype[name] = function () {
      this.inst[name].apply(this.inst, arguments);
      var args = arguments;
      var o = { type: name };
      namedArgs.forEach(function (arg, i) {
        o[arg] = stringify(args[i]);
      });
      this.state.push(o);
    };
  });

  SubKlass.prototype.getState = function () {
    return this.state;
  }

  return SubKlass;
};
// TODO: battle-preservative should subclass this and have pre-registered the API
// so that it can work correctly

// this should be the more general version
