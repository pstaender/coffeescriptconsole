// Generated by CoffeeScript 1.6.3
(function() {
  var Json2Html, exports, json2html, json2htmlTests;
  Json2Html = function(o, options) {
    var attr, part, parts;
    if (options == null) {
      options = {};
    }
    if (this.references == null) {
      this.references = [];
    }
    for (attr in options) {
      this[attr] = options[attr];
    }
    if (typeof o === 'object' && o !== null) {
      if (this.references.indexOf(o) !== -1) {
        return this.html += "<span class=\"circularReference\">@circularReference</span>";
      }
      this.references.push(o);
      if (o.constructor === Array) {
        parts = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = o.length; _i < _len; _i++) {
            part = o[_i];
            _results.push("<li class=\"" + (typeof part) + "\"><span class=\"value\">" + (new Json2Html(part).toString()) + "</span></li>");
          }
          return _results;
        })();
        return this.html += "<ol class=\"array\">" + (parts.join('')) + "</ol>";
      } else {
        parts = (function() {
          var _results;
          _results = [];
          for (attr in o) {
            if (o.hasOwnProperty(attr)) {
              _results.push("<li class=\"" + (typeof o[attr]) + "\"><span class=\"attribute\">" + attr + "</span><span class=\"value\">" + (new Json2Html(o[attr], {
                references: this.references
              }).toString()) + "</span></li>");
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }).call(this);
        return this.html += "<ul class=\"object\">" + (parts.join('')) + "</ul>";
      }
    } else if (typeof o === 'string') {
      return this.html += this.stringDelimiter + o.replace(new RegExp("[\\\\" + this.stringDelimiter + "]", 'g', '\\$&')) + this.stringDelimiter;
    } else {
      return this.html += String(o);
    }
  };
  Json2Html.prototype.stringDelimiter = '"';
  Json2Html.prototype.html = '';
  Json2Html.prototype.references = null;
  Json2Html.prototype.toString = function() {
    return this.html;
  };
  json2html = function(o) {
    if (o === null || typeof o !== 'object') {
      return '';
    } else {
      return new Json2Html(o).toString();
    }
  };
  if (window) {
    window.json2html = json2html;
    window.Json2Html = Json2Html;
  } else {
    exports = {
      json2html: json2html,
      Json2Html: Json2Html
    };
  }
  return json2htmlTests = function() {
    var expected, html, object, testCase, testCases, testsCount, _i, _len;
    testCases = [
      {
        "": null
      }, {
        "": true
      }, {
        "": 1
      }, {
        "": "test"
      }, {
        '<ol class="array"><li class="string">"a"</li><li class="string">"b"</li><li class="number">1</li></ol>': ['a', 'b', 1]
      }, {
        '<ul class="object"><li class="string"><span class="attribute">a</span><span class="value">"String"</span></li><li class="string"><span class="attribute">b_true</span><span class="value">true</span></li><li class="string"><span class="attribute">cFalse</span><span class="value">false</span></li><li class="string"><span class="attribute">d</span><span class="value">null</span></li><li class="string"><span class="attribute">e</span><span class="value">2.718281828459045</span></li><li class="string"><span class="attribute">o</span><span class="value"><ul class="object"><li class="string"><span class="attribute">a</span><span class="value">"String"</span></li></ul></span></li></ul>': {
          a: "String",
          b_true: true,
          "cFalse": false,
          d: null,
          e: Math.exp(1),
          o: {
            a: "String"
          }
        }
      }
    ];
    testsCount = 0;
    for (_i = 0, _len = testCases.length; _i < _len; _i++) {
      testCase = testCases[_i];
      testsCount++;
      expected = Object.keys(testCase)[0];
      object = testCase[expected];
      html = json2html(object);
      if (html !== expected) {
        throw Error("Expected: `" + expected + "`\nbut got:\n`" + html + "`");
      }
    }
    return console.log("" + testsCount + " Tests passed ✓");
  };
})();

/*
//@ sourceMappingURL=json2html.map
*/
