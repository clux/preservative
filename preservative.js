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

module.exports = function (Klass, apiList, proxyList) {
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

    // getters for vars on inst
    Object.keys(inst).forEach(function (key) {
      Object.defineProperty(this, key, {
        get: function () {
          return inst[key];
        }
      });
    }.bind(this));
    // forward methods
    // needs to be specified which ones as they can exist on several places:
    // inst, Klass.prototype, UnknownSuperClasses.prototype
    proxyList.filter(function (method) {
      // but never allow overriding the ones we are keeping track of
      return Object.keys(apiList).indexOf(method) < 0;
    }).forEach(function (method) {
      this[method] = inst[method].bind(inst);
    }.bind(this));
  }

  Object.keys(apiList).forEach(function (name) {
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
