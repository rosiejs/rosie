/**
 * Creates a new factory with attributes, options, etc. to be used to build
 * objects.
 *
 * @param {Function=} constructor
 * @class
 */
class Factory {
  constructor(constructor) {
    this.construct = constructor;
    this._attrs = {};
    this.opts = {};
    this.sequences = {};
    this.callbacks = [];

    Factory._allFactories.push(this);
  }

  /**
   * Define an attribute on this factory. Attributes can optionally define a
   * default value, either as a value (e.g. a string or number) or as a builder
   * function. For example:
   *
   *   // no default value for age
   *   Factory.define('Person').attr('age')
   *
   *   // static default value for age
   *   Factory.define('Person').attr('age', 18)
   *
   *   // dynamic default value for age
   *   Factory.define('Person').attr('age', function() {
   *      return Math.random() * 100;
   *   })
   *
   * Attributes with dynamic default values can depend on options or other
   * attributes:
   *
   *   Factory.define('Person').attr('age', ['name'], function(name) {
   *     return name === 'Brian' ? 30 : 18;
   *   });
   *
   * By default if the consumer of your factory provides a value for an
   * attribute your builder function will not be called. You can override this
   * behavior by declaring that your attribute depends on itself:
   *
   *   Factory.define('Person').attr('spouse', ['spouse'], function(spouse) {
   *     return Factory.build('Person', spouse);
   *   });
   *
   * As in the example above, this can be a useful way to fill in
   * partially-specified child objects.
   *
   * @param {string} attr
   * @param {Array.<string>=} dependencies
   * @param {*=} value
   * @return {Factory}
   */
  attr(attr, dependencies, value) {
    let builder;
    if (arguments.length === 2) {
      value = dependencies;
      dependencies = null;
    }

    builder = typeof value === 'function' ? value : () => value;
    this._attrs[attr] = { dependencies: dependencies || [], builder: builder };
    return this;
  }

  /**
   * Convenience function for defining a set of attributes on this object as
   * builder functions or static values. If you need to specify dependencies,
   * use #attr instead.
   *
   * For example:
   *
   *   Factory.define('Person').attrs({
   *     name: 'Michael',
   *     age: function() { return Math.random() * 100; }
   *   });
   *
   * @param {object} attributes
   * @return {Factory}
   */
  attrs(attributes) {
    for (let attr in attributes) {
      if (Object.prototype.hasOwnProperty.call(attributes, attr)) {
        this.attr(attr, attributes[attr]);
      }
    }
    return this;
  }

  /**
   * Define an option for this factory. Options are values that may inform
   * dynamic attribute behavior but are not included in objects built by the
   * factory. Like attributes, options may have dependencies. Unlike
   * attributes, options may only depend on other options.
   *
   *   Factory.define('Person')
   *     .option('includeRelationships', false)
   *     .attr(
   *       'spouse',
   *       ['spouse', 'includeRelationships'],
   *       function(spouse, includeRelationships) {
   *         return includeRelationships ?
   *           Factory.build('Person', spouse) :
   *           null;
   *       });
   *
   *   Factory.build('Person', null, { includeRelationships: true });
   *
   * Options may have either static or dynamic default values, just like
   * attributes. Options without default values must have a value specified
   * when building.
   *
   * @param {string} opt
   * @param {Array.<string>=} dependencies
   * @param {*=} value
   * @return {Factory}
   */
  option(opt, dependencies, value) {
    let builder;
    if (arguments.length === 2) {
      value = dependencies;
      dependencies = null;
    }
    if (arguments.length > 1) {
      builder = typeof value === 'function' ? value : () => value;
    }
    this.opts[opt] = { dependencies: dependencies || [], builder };
    return this;
  }

  /**
   * Defines an attribute that, by default, simply has an auto-incrementing
   * numeric value starting at 1. You can provide your own builder function
   * that accepts the number of the sequence and returns whatever value you'd
   * like it to be.
   *
   * Sequence values are inherited such that a factory derived from another
   * with a sequence will share the state of that sequence and they will never
   * conflict.
   *
   *   Factory.define('Person').sequence('id');
   *
   * @param {string} attr
   * @param {Array.<string>=} dependencies
   * @param {function(number): *=} builder
   * @return {Factory}
   */
  sequence(attr, dependencies, builder) {
    if (arguments.length === 2) {
      builder = /** @type function(number): * */ dependencies;
      dependencies = null;
    }
    builder = builder || ((i) => i);
    return this.attr(attr, dependencies, (...args) => {
      this.sequences[attr] = this.sequences[attr] || 0;
      args.unshift(++this.sequences[attr]);
      return builder(...args);
    });
  }

  /**
   * Sets a post-processor callback that will receive built objects and the
   * options for the build just before they are returned from the #build
   * function.
   *
   * @param {function(object, object=)} callback
   * @return {Factory}
   */
  after(callback) {
    this.callbacks.push(callback);
    return this;
  }

  /**
   * Builds a plain object containing values for each of the declared
   * attributes. The result of this is the same as the result when using #build
   * when there is no constructor registered.
   *
   * @param {object=} attributes
   * @param {object=} options
   * @return {object}
   */
  attributes(attributes, options) {
    attributes = { ...attributes };
    options = this.options(options);
    for (let attr in this._attrs) {
      this._attrValue(attr, attributes, options, [attr]);
    }
    return attributes;
  }

  /**
   * Generates a value for the given named attribute and adds the result to the
   * given attributes list.
   *
   * @private
   * @param {string} attr
   * @param {object} attributes
   * @param {object} options
   * @param {Array.<string>} stack
   * @return {*}
   */
  _attrValue(attr, attributes, options, stack) {
    if (
      !this._alwaysCallBuilder(attr) &&
      Object.prototype.hasOwnProperty.call(attributes, attr)
    ) {
      return attributes[attr];
    }

    const value = this._buildWithDependencies(this._attrs[attr], (dep) => {
      if (Object.prototype.hasOwnProperty.call(options, dep)) {
        return options[dep];
      } else if (dep === attr) {
        return attributes[dep];
      } else if (stack.indexOf(dep) >= 0) {
        throw new Error(
          'detected a dependency cycle: ' + stack.concat([dep]).join(' -> ')
        );
      } else {
        return this._attrValue(dep, attributes, options, stack.concat([dep]));
      }
    });
    attributes[attr] = value;
    return value;
  }

  /**
   * Determines whether the given named attribute has listed itself as a
   * dependency.
   *
   * @private
   * @param {string} attr
   * @return {boolean}
   */
  _alwaysCallBuilder(attr) {
    const attrMeta = this._attrs[attr];
    return attrMeta.dependencies.indexOf(attr) >= 0;
  }

  /**
   * Generates values for all the registered options using the values given.
   *
   * @private
   * @param {?object} options
   * @return {object}
   */
  options(options = {}) {
    options = { ...options };
    for (let opt in this.opts) {
      options[opt] = this._optionValue(opt, options);
    }
    return options;
  }

  /**
   * Generates a value for the given named option and adds the result to the
   * given options list.
   *
   * @private
   * @param {string} opt
   * @param {object} options
   * @return {*}
   */
  _optionValue(opt, options) {
    if (Object.prototype.hasOwnProperty.call(options, opt)) {
      return options[opt];
    }

    const optMeta = this.opts[opt];
    if (!optMeta.builder) {
      throw new Error(
        'option `' + opt + '` has no default value and none was provided'
      );
    }

    return this._buildWithDependencies(optMeta, (dep) =>
      this._optionValue(dep, options)
    );
  }

  /**
   * Calls the builder function with its dependencies as determined by the
   * given dependency resolver.
   *
   * @private
   * @param {{builder: function(...[*]): *, dependencies: Array.<string>}} meta
   * @param {function(string): *} getDep
   * @return {*}
   */
  _buildWithDependencies(meta, getDep) {
    const deps = meta.dependencies;
    const args = deps.map((...args) => getDep.apply(this, args));
    return meta.builder.apply(this, args);
  }

  /**
   * Builds objects by getting values for all attributes and optionally passing
   * the result to a constructor function.
   *
   * @param {object=} attributes
   * @param {object=} options
   * @return {*}
   */
  build(attributes, options) {
    // Precalculate options.
    // Because options cannot depend on themselves or on attributes, subsequent calls to
    // `this.options` will be idempotent and we can avoid re-running builders
    options = this.options(options);
    const result = this.attributes(attributes, options);
    let retval = null;

    if (this.construct) {
      const Constructor = this.construct;
      retval = new Constructor(result);
    } else {
      retval = result;
    }

    for (let i = 0; i < this.callbacks.length; i++) {
      const callbackResult = this.callbacks[i](retval, options);
      retval = callbackResult || retval;
    }
    return retval;
  }

  buildList(size, attributes, options) {
    const objs = [];
    for (let i = 0; i < size; i++) {
      objs.push(this.build(attributes, options));
    }
    return objs;
  }

  /**
   * Extends a given factory by copying over its attributes, options,
   * callbacks, and constructor. This can be useful when you want to make
   * different types which all share certain attributes.
   *
   * @param {string|Factory} name The factory to extend.
   * @return {Factory}
   */
  extend(name) {
    const factory = typeof name === 'string' ? Factory.factories[name] : name;
    // Copy the parent's constructor
    if (this.construct === undefined) {
      this.construct = factory.construct;
    }
    Object.assign(this._attrs, factory._attrs);
    Object.assign(this.opts, factory.opts);
    // Copy the parent's callbacks
    this.callbacks = factory.callbacks.slice();
    return this;
  }

  /**
   * Resets any state changed by building objects back to the original values.
   * Preserves attributes and options as-is.
   */
  reset() {
    this.sequences = {};
  }
}

Factory.factories = {};
Object.defineProperty(Factory, '_allFactories', {
  value: [],
  enumerable: false,
});

/**
 * Defines a factory by name and constructor function. Call #attr and #option
 * on the result to define the properties of this factory.
 *
 * @param {!string} name
 * @param {function(object): *=} constructor
 * @return {Factory}
 */
Factory.define = function (name, constructor) {
  const factory = new Factory(constructor);
  this.factories[name] = factory;
  return factory;
};

/**
 * Locates a factory by name and calls #build on it.
 *
 * @param {string} name
 * @param {object=} attributes
 * @param {object=} options
 * @return {*}
 */
Factory.build = function (name, attributes, options) {
  if (!this.factories[name]) {
    throw new Error(`The "${name}" factory is not defined.`);
  }
  return this.factories[name].build(attributes, options);
};

/**
 * Builds a collection of objects using the named factory.
 *
 * @param {string} name
 * @param {number} size
 * @param {object=} attributes
 * @param {object=} options
 * @return {Array.<*>}
 */
Factory.buildList = function (name, size, attributes, options) {
  const objs = [];
  for (let i = 0; i < size; i++) {
    objs.push(Factory.build(name, attributes, options));
  }
  return objs;
};

/**
 * Locates a factory by name and calls #attributes on it.
 *
 * @param {string} name
 * @param {object} attributes
 * @param {object} options
 * @return {object}
 */
Factory.attributes = function (name, attributes, options) {
  return this.factories[name].attributes(attributes, options);
};

/**
 * Resets a factory by name. Preserves attributes and options as-is.
 *
 * @param {string} name
 */
Factory.reset = function (name) {
  Factory.factories[name].reset();
};

/**
 * Resets all factory build state. Preserves attributes and options as-is.
 */
Factory.resetAll = function () {
  Factory._allFactories.forEach((factory) => factory.reset());
};

/**
 * Unregister and forget all existing factories.
 */
Factory.implode = function () {
  Factory.factories = {};
  Factory._allFactories.length = 0;
};

/* istanbul ignore next */
if (typeof exports === 'object' && typeof module !== 'undefined') {
  /* eslint-env commonjs */
  exports.Factory = Factory;
  /* eslint-env commonjs:false */
} else if (typeof define === 'function' && define.amd) {
  /* eslint-env amd */
  define([], () => ({
    Factory: Factory,
  }));
  /* eslint-env amd:false */
} else if (this) {
  this.Factory = Factory;
}
