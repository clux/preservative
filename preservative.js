var slice = Array.prototype.slice;

var construct = function (Ctor, args) {
  var F;
  F = function () {
    return Ctor.apply(this, args);
  };
  F.prototype = Ctor.prototype;
  return new F();
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

var validOp = function (op) {
  return 'string' === typeof op.type && Array.isArray(op.args);
};

module.exports = function (Klass, apiList, opts) {
  opts = opts || {};

  // create a wrapper class
  function SubKlass() {
    this.state = [{
      type: 'new',
      args: slice.call(arguments, 0)
    }];

    var inst = construct(Klass, arguments);
    this.inst = inst;

    getKeysDeep(inst).filter(function (key) {
      // never allow overriding the ones we are keeping track of
      return apiList.indexOf(key) < 0;
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

  apiList.forEach(function (name) {
    SubKlass.prototype[name] = function () {
      var res = this.inst[name].apply(this.inst, arguments);
      if (!(!res && opts.filterNoops)) {
        this.state.push({
          type: name,
          args: slice.call(arguments, 0)
        });
      }
      return res;
    };
  });

  SubKlass.prototype.preserve = function () {
    return this.state.slice();
  };

  SubKlass.from = function (preserve) {
    if (!Array.isArray(preserve)) {
      throw new Error("No operations preserved");
    }
    if (!validOp(preserve[0]) || preserve[0].type !== 'new') {
      throw new Error("First operation must be a valid 'new'" + preserve[0].type);
    }

    // recreate with same ctor args
    var inst = construct(SubKlass, preserve[0].args);

    // re-apply all worthy operations to the state machine in correct order
    preserve.slice(1).forEach(function (op) {
      if (!validOp(op)) {
        var s = JSON.stringify(op);
        throw new Error("Preserved operation " + s + " invalid");
      }
      inst[op.type].apply(inst, op.args);
    });

    return inst;
  };

  return SubKlass;
};
