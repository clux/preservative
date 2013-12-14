var construct = function (Ctor, args) {
  var F;
  F = function () {
    return Ctor.apply(this, args);
  };
  F.prototype = Ctor.prototype;
  return new F();
};


module.exports = function (Klass, apiList) {
  function SubKlass() {
    this.state = [];
    var args = arguments;
    var o = {};
    apiList.new.forEach(function (arg, i) {
      o[arg] = args[i]; // TODO: always stringify
    });
    this.state.push(o);

    var inst = construct(Klass, arguments);

    // TODO: try to create getters for every public property on inst
    this.inst = inst;
    this.results = inst.results;
    ['numPlayers', 'results', 'matches', 'isDone'].forEach(function (prop) {
      Object.defineProperty(this, prop, {
        get: function () {
          return (inst[prop] instanceof Function) ?
            inst[prop].apply(inst, arguments) :
            inst[prop];
        }
      });
    }.bind(this));
  }

  Object.keys(apiList).forEach(function (name) {
    var namedArgs = apiList[name];
    SubKlass.prototype[name] = function () {
      this.inst[name].apply(this.inst, arguments);
      var args = arguments;
      var o = {};
      namedArgs.forEach(function (arg, i) {
        o[arg] = Object(args[i]) === args[i] ? JSON.stringify(args[i]) : args[i] + '';
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
