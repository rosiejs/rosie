describe('JSHint', function () {
  var options = {curly: true, indent: 2, white: false},
      files = /^\/src/;

  function get(path) {
    path = path + "?" + new Date().getTime();

    var xhr;
    try {
      xhr = new jasmine.XmlHttpRequest();
      xhr.open("GET", path, false);
      xhr.send(null);
    } catch (e) {
      throw new Error("couldn't fetch " + path + ": " + e);
    }
    if (xhr.status < 200 || xhr.status > 299) {
      throw new Error("Could not load '" + path + "'.");
    }

    return xhr.responseText;
  }

  it("should not have JSHint errors", function () {
    var scripts = document.getElementsByTagName('script');
    for(var i = 0; i < scripts.length; i++) {
      var script = scripts[i].getAttribute('src');
      if (files.test(script)) {
          var source = get(script);
          var result = JSHINT(source, options);
          for(var e in JSHINT.errors) {
            var error = JSHINT.errors[e];
            this.addMatcherResult(new jasmine.ExpectationResult({
              passed: false,
              message: script + ":" + error.line + ' - ' + error.reason + ' - ' + error.evidence
            }));
          }
          expect(true).toBe(true); // force spec to show up if there are no errors
      };
    }
  });

});
