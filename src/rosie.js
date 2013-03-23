var Factory = function(constructor) {
  this.construct = constructor;
  this.attrs = {};
  this.sequences = {};
  this.traits = {};
};

Factory.prototype = {
  attr: function(attr, value) {
    var callback = typeof value == 'function' ? value : function() { return value; };
    this.attrs[attr] = callback;
    return this;
  },

  sequence: function(attr, callback) {
    var factory = this;
    callback = callback || function(i) { return i; };
    this.attrs[attr] = function() {
      factory.sequences[attr] = factory.sequences[attr] || 0;
      return callback(++factory.sequences[attr]);
    };
    return this;
  },

  attributes: function(attrs) {
    attrs = attrs || {};
    for(var attr in this.attrs) {
      if(!attrs.hasOwnProperty(attr)) {
        attrs[attr] = this.attrs[attr]();
      }
    }
    return attrs;
  },

  trait: function(name, callback) {
    this.traits[name] = callback;
    return this;
  },

  build: function(options) {
    for(var attr in options) {
      if(attr === 'traits' && options[attr] instanceof Array && this.attrs.trait === undefined) {
        for(var i in options[attr]) {
          var trait = options[attr][i];
          if (typeof trait === 'string') {
            this.traits[trait].call(this);
          } else {
            for(var j in trait) {
              this.traits[j].call(this, trait[j]);
            }
          }
        }
        delete options[attr];
      }
    }
    var result = this.attributes(options);
    return this.construct ? new this.construct(result) : result;
  },

  extend: function(name) {
    var factory = Factory.factories[name];
    for(var attr in factory.attrs) {
      if(factory.attrs.hasOwnProperty(attr)) {
        this.attrs[attr] = factory.attrs[attr];
      }
    }
    return this;
  }
};

Factory.factories = {};

Factory.define = function(name, constructor) {
  var factory = new Factory(constructor);
  this.factories[name] = factory;
  return factory;
};

Factory.build = function(name, attrs) {
  return this.factories[name].build(attrs);
};

Factory.attributes = function(name, attrs) {
  return this.factories[name].attributes(attrs);
};

if (typeof exports != "undefined") {
  exports.Factory = Factory;
}
