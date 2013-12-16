var construct = function (Ctor, args) {
  var F;
  F = function () {
    return Ctor.apply(this, args);
  };
  F.prototype = Ctor.prototype;
  return new F();
};

// converts a preserve object to an argument list to apply with
var fetchArguments = function (obj) {
  var args = [];
  Object.keys(obj).forEach(function (key) {
    if (key !== 'type') {
      args.push(obj[key]);
    }
  });
  return args;
};

var getKeysDeep = function (inst) {
  var keys = Object.keys(inst);
  for (var obj = inst; obj !== null; obj = Object.getPrototypeOf(obj)) {
    var currKeys = Object.keys(obj);
    for (var i = 0; i < currKeys.length; i += 1) {
      var key = currKeys[i];
      if (keys.indexOf(key) < 0) {
        keys.push(key);
      }
    }
  }
  return keys;
};
module.exports = function (Klass, apiList) {
  var apiKeys = Object.keys(apiList);

  // create a wrapper class
  function SubKlass() {
    this.state = [];
    var args = arguments;
    var o = { type: 'new' };
    apiList.new.forEach(function (arg, i) {
      o[arg] = args[i];
    });
    this.state.push(o);

    var inst = construct(Klass, arguments);
    this.inst = inst;

    getKeysDeep(inst).filter(function (key) {
      // never allow overriding the ones we are keeping track of
      return apiKeys.indexOf(key) < 0;
    }).forEach(function (key) {
      if (typeof inst[key] === 'function') {
        // forward methods
        this[key] = inst[key].bind(inst);
      }
      else {
        // proxy variables
        Object.defineProperty(this, key, {
          get: function () {
            return inst[key];
          }
        });
      }
    }.bind(this));
  }

  apiKeys.forEach(function (name) {
    var namedArgs = apiList[name];
    SubKlass.prototype[name] = function () {
      this.inst[name].apply(this.inst, arguments);
      var args = arguments;
      var o = { type: name };
      namedArgs.forEach(function (arg, i) {
        o[arg] = args[i];
      });
      this.state.push(o);
    };
  });

  SubKlass.prototype.preserve = function () {
    return this.state;
  };

  SubKlass.from = function (preserve) {
    if (!preserve || !preserve.length || preserve[0].type !== 'new') {
      throw new Error("Type 'new' must be first in the preserve");
    }
    // recreate with same ctor args
    var args = fetchArguments(preserve[0]);
    var inst = construct(SubKlass, args);

    // re-apply all worthy operations to the state machine in correct order
    preserve.slice(1).forEach(function (op) {
      var args = fetchArguments(op);
      inst[op.type].apply(inst, args);
    });

    return inst;
  };

  return SubKlass;
};
