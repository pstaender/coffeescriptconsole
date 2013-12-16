// Generated by CoffeeScript 1.6.3
var CoffeeScriptConsole;

CoffeeScriptConsole = (function() {
  CoffeeScriptConsole.prototype.outputContainer = '<pre class="outputResult"></pre>';

  CoffeeScriptConsole.prototype.echoEvalOutput = true;

  CoffeeScriptConsole.prototype.storeInput = true;

  CoffeeScriptConsole.prototype.storeOutput = true;

  CoffeeScriptConsole.prototype.adjustInputHeightUnit = 'em';

  function CoffeeScriptConsole(options) {
    var attr, o, outputHistory, _i, _len;
    if (options == null) {
      options = {};
    }
    if (typeof $ === "undefined" || $ === null) {
      throw Error('jQuery is required to use CoffeeScriptConsole');
    }
    if (options.$input == null) {
      options.$input = $('#consoleInput');
    }
    if (options.$output == null) {
      options.$output = $('#consoleOutput');
    }
    if (store && this.storeInput) {
      this.history = store.get('CoffeeScriptConsole_history') || [];
    }
    this.suggestions = [];
    for (attr in options) {
      this[attr] = options[attr];
    }
    if (store && this.storeOutput) {
      outputHistory = store.get('CoffeeScriptConsole_output') || [];
      for (_i = 0, _len = outputHistory.length; _i < _len; _i++) {
        o = outputHistory[_i];
        this.echo(o.output, o.classification, false);
      }
    }
    this.init();
  }

  CoffeeScriptConsole.prototype.lastCommand = function() {
    return history[history.length] || null;
  };

  CoffeeScriptConsole.prototype.history = null;

  CoffeeScriptConsole.prototype.suggestions = null;

  CoffeeScriptConsole.prototype._currentHistoryPosition = null;

  CoffeeScriptConsole.prototype.addToHistory = function(command) {
    command = command != null ? command.trim() : void 0;
    if (command) {
      if (this.history[this.history.length - 1] && this.history[this.history.length - 1] === command) {
        return;
      }
      this.history.push(command);
    }
    if (store && this.storeInput) {
      return store.set('CoffeeScriptConsole_history', this.history);
    }
  };

  CoffeeScriptConsole.prototype.historySuggestionsFor = function(term) {
    var command, history, s, suggestions, _i, _len;
    term = String(term).trim();
    suggestions = [];
    history = [].concat(this.history).reverse().concat(this.suggestions);
    if (term !== '') {
      for (_i = 0, _len = history.length; _i < _len; _i++) {
        command = history[_i];
        s = String(command).trim();
        if (s !== '' && s !== term && s.substring(0, term.length) === term && suggestions.indexOf(s) === -1) {
          suggestions.push(s);
        }
      }
    }
    return suggestions;
  };

  CoffeeScriptConsole.prototype.clearHistory = function() {
    this.clearOutputHistory();
    return this.clearInputHistory();
  };

  CoffeeScriptConsole.prototype.clearInputHistory = function() {
    this.history = [];
    if (store && this.storeInput) {
      return store.set('CoffeeScriptConsole_history', this.history);
    }
  };

  CoffeeScriptConsole.prototype.clearOutputHistory = function() {
    if (store && this.storeOutput) {
      return store.set('CoffeeScriptConsole_output', []);
    }
  };

  CoffeeScriptConsole.prototype._lastPrompt = '';

  CoffeeScriptConsole.prototype._objectIsError = function(o) {
    if (o && typeof o.message !== 'undefined') {
      return true;
    } else {
      return false;
    }
  };

  CoffeeScriptConsole.prototype._resultToString = function(output) {
    if (typeof output === 'object' && output !== null) {
      if (output.constructor === Array) {
        return json2html(output);
      } else if (this._objectIsError(output)) {
        return output.message;
      } else {
        return json2html(output);
      }
    } else if (output === void 0) {
      return 'undefined';
    } else if (typeof output === 'function') {
      return output.toString();
    } else if (String(output).trim() === '') {
      return '';
    } else {
      return output;
    }
  };

  CoffeeScriptConsole.prototype._setCursorToEnd = function(e, $e) {
    e.preventDefault();
    return $e.get(0).setSelectionRange($e.val().length, $e.val().length);
  };

  CoffeeScriptConsole.prototype._setCursorToStart = function(e, $e) {
    var _ref, _ref1;
    e.preventDefault();
    return $e.get(0).setSelectionRange((_ref = $e.val().split('\n')) != null ? _ref[0].length : void 0, (_ref1 = $e.val().split('\n')) != null ? _ref1[0].length : void 0);
  };

  CoffeeScriptConsole.prototype._insertAtCursor = function($e, myValue) {
    var endPos, myField, sel, startPos, temp;
    myField = $e.get(0);
    if (document.selection) {
      temp = void 0;
      myField.focus();
      sel = document.selection.createRange();
      temp = sel.text.length;
      sel.text = myValue;
      if (myValue.length === 0) {
        sel.moveStart("character", myValue.length);
        sel.moveEnd("character", myValue.length);
      } else {
        sel.moveStart("character", -myValue.length + temp);
      }
      return sel.select();
    } else if (myField.selectionStart || myField.selectionStart === 0) {
      startPos = myField.selectionStart;
      endPos = myField.selectionEnd;
      myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
      myField.selectionStart = startPos + myValue.length;
      return myField.selectionEnd = startPos + myValue.length;
    } else {
      return myField.value += myValue;
    }
  };

  CoffeeScriptConsole.prototype._adjustTextareaHeight = function($e, lines) {
    if (lines == null) {
      lines = null;
    }
    if (lines === null) {
      lines = $e.val().split('\n').length;
    }
    if (this.adjustInputHeightUnit) {
      return $e.css('height', (lines * 1.5) + this.adjustInputHeightUnit);
    } else {
      return $e.attr('rows', lines);
    }
  };

  CoffeeScriptConsole.prototype._keyIsTriggeredManuallay = false;

  CoffeeScriptConsole.prototype.echo = function(output, classification, doStore) {
    var $e, $output, cssClass, history, outputAsString;
    if (typeof doStore !== 'boolean') {
      doStore = this.storeOutput;
    }
    $e = $(this.outputContainer);
    $output = this.$output;
    cssClass = '';
    if (typeof classification === 'string' && classification !== 'evalOutput') {
      cssClass = classification;
      $e.addClass(cssClass);
    } else {
      if (classification === 'evalOutput' && !this.echoEvalOutput) {
        return $e;
      }
      if (typeof output === 'function') {
        cssClass = 'function';
      } else if (typeof output === 'number') {
        cssClass = 'number';
      } else if (typeof output === 'boolean') {
        cssClass = 'boolean';
      } else if (typeof output === 'string') {
        cssClass = 'string';
      } else if (output === void 0) {
        cssClass = 'undefined';
      } else if (typeof output === 'object') {
        if (this._objectIsError(output)) {
          cssClass = 'error';
        } else if (output === null) {
          cssClass = 'null';
        } else if ((output != null ? output.constructor : void 0) === Array) {
          cssClass = 'array';
        } else {
          cssClass = 'object';
        }
      }
    }
    if (cssClass) {
      $e.addClass(cssClass);
    }
    if (store && doStore) {
      history = store.get('CoffeeScriptConsole_output') || [];
      history.push({
        output: this._resultToString(output),
        classification: cssClass
      });
      store.set('CoffeeScriptConsole_output', history);
    }
    outputAsString = this._resultToString(output);
    if (/^\<.+\>/.test(outputAsString)) {
      $e.html(outputAsString);
    } else {
      $e.text(outputAsString);
    }
    $output.prepend($e);
    setTimeout(function() {
      return $e.addClass('visible');
    }, 100);
    return $e;
  };

  CoffeeScriptConsole.prototype.init = function() {
    var $input, $output, self, suggestionFor, suggestionNr;
    $output = this.$output;
    $input = this.$input;
    self = this;
    $input.on('keyup', function(e) {
      var code, cursorPosition, linesCount;
      code = $(this).val();
      cursorPosition = $input.get(0).selectionStart;
      linesCount = code.split('\n').length;
      self._adjustTextareaHeight($input);
      if (e.keyCode === 9 && cursorPosition !== code.length) {
        return self._insertAtCursor($input, '  ');
      }
    });
    suggestionFor = null;
    suggestionNr = 0;
    return $input.on('keydown', function(e) {
      var code, cursorPosition, linesCount, originalCode, suggestions, _ref, _ref1;
      code = originalCode = $(this).val();
      cursorPosition = $input.get(0).selectionStart;
      linesCount = code.split('\n').length;
      if (code.trim() !== self._lastPrompt) {
        $(this).removeClass('error');
      }
      if (e.keyCode === 9) {
        e.preventDefault();
        if (cursorPosition === code.length) {
          if (suggestionFor === null) {
            suggestionFor = code;
          }
          suggestions = self.historySuggestionsFor(suggestionFor);
          if (suggestions[suggestionNr]) {
            $(this).val(suggestions[suggestionNr]);
            if (suggestionNr + 1 <= suggestions.length) {
              suggestionNr++;
            } else {
              suggestionNr = 0;
              $(this).val('');
            }
          }
        } else {
          suggestionFor = null;
          suggestionNr = 0;
        }
      } else {
        suggestionFor = null;
        suggestionNr = 0;
      }
      if (e.keyCode === 38) {
        if (!(cursorPosition <= ((_ref = originalCode.split("\n")) != null ? (_ref1 = _ref[0]) != null ? _ref1.length : void 0 : void 0))) {
          return;
        }
        if (self._currentHistoryPosition === 0) {
          return;
        }
        if (self._currentHistoryPosition === null) {
          self._currentHistoryPosition = self.history.length;
        }
        self._currentHistoryPosition--;
        code = self.history[self._currentHistoryPosition];
        $(this).val(code);
        self._setCursorToStart(e, $(this));
      } else if (e.keyCode === 40 && self._currentHistoryPosition >= 0) {
        if (!(cursorPosition >= originalCode.split("\n").splice(0, linesCount).join(' ').length)) {
          return;
        }
        if (self._currentHistoryPosition === null) {
          self._currentHistoryPosition = self.history.length - 1;
        } else if (self.history.length === (self._currentHistoryPosition + 1)) {
          self._currentHistoryPosition = null;
          $(this).val('');
          return;
        }
        self._currentHistoryPosition++;
        code = self.history[self._currentHistoryPosition] || '';
        $(this).val(code);
        self._setCursorToEnd(e, $(this));
        if (!code) {
          self._currentHistoryPosition = null;
          return;
        }
      } else if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();
        self.executeCode();
      }
      if (typeof code === 'string') {
        self._lastPrompt = code.trim();
      }
      return self._adjustTextareaHeight($(this));
    });
  };

  CoffeeScriptConsole.prototype.executeCode = function(code, $input) {
    var $e, e, js, output, _ref;
    if (code == null) {
      code = (_ref = this.$input) != null ? _ref.val() : void 0;
    }
    if ($input == null) {
      $input = this.$input;
    }
    try {
      js = CoffeeScript.compile(code, {
        bare: true
      });
      output = eval.call(window, js);
      $input.val('');
      this._currentHistoryPosition = null;
      this.addToHistory(code);
      $e = this.echo(output, 'evalOutput');
      if (this._resultToString(output) === '') {
        return;
      }
      return this.onAfterEvaluate(output, $e);
    } catch (_error) {
      e = _error;
      $input.addClass('error');
      $e = this.echo(e, 'evalOutput');
      return this.onCodeError(e, $e);
    }
  };

  CoffeeScriptConsole.prototype.onAfterEvaluate = function(output, $e) {};

  CoffeeScriptConsole.prototype.onCodeError = function(error, $e) {};

  return CoffeeScriptConsole;

})();

/*
//@ sourceMappingURL=csc.map
*/
