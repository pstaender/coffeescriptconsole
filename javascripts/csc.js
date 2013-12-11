// Generated by CoffeeScript 1.6.3
var CoffeeScriptConsole;

CoffeeScriptConsole = (function() {
  CoffeeScriptConsole.prototype.outputContainer = '<pre class="outputResult"></pre>';

  CoffeeScriptConsole.prototype.lastCommand = function() {
    return history[history.length] || null;
  };

  CoffeeScriptConsole.prototype.history = [];

  CoffeeScriptConsole.prototype._currentHistoryPosition = null;

  CoffeeScriptConsole.prototype.addToHistory = function(command) {
    command = command != null ? command.trim() : void 0;
    if (command) {
      if (this.history[this.history.length - 1] && this.history[this.history.length - 1] === command) {
        return;
      }
      this.history.push(command);
    }
    if (store) {
      return store.set('CoffeeScriptConsole_history', this.history);
    }
  };

  CoffeeScriptConsole.prototype._lastPrompt = '';

  CoffeeScriptConsole.prototype._resultToString = function(output) {
    if (typeof output === 'object' && output !== null) {
      if (output.constructor === Array) {
        return JSON.stringify(output);
      } else if (output.constructor === Error) {
        return output.message;
      } else {
        return JSON.stringify(output, null, '  ');
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
    return $e.css('height', lines + 'em');
  };

  function CoffeeScriptConsole(options) {
    var attr;
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
    if (store) {
      this.history = store.get('CoffeeScriptConsole_history') || [];
    }
    for (attr in options) {
      this[attr] = options[attr];
    }
    this.init();
  }

  CoffeeScriptConsole.prototype._keyIsTriggeredManuallay = false;

  CoffeeScriptConsole.prototype.echo = function(output) {
    var $e, $output, outputAsString;
    $output = this.$output;
    $e = $(this.outputContainer);
    if (typeof output === 'function') {
      if (typeof output.constructor === Error) {
        $e.addClass('error');
      } else {
        $e.addClass('function');
      }
    } else if (typeof output === 'number') {
      $e.addClass('number');
    } else if (typeof output === 'boolean') {
      $e.addClass('boolean');
    } else if (typeof output === 'string') {
      $e.addClass('string');
    } else if (output === void 0) {
      $e.addClass('undefined');
    } else if (typeof output === 'object') {
      if (output === null) {
        $e.addClass('null');
      } else if ((output != null ? output.constructor : void 0) === Array) {
        $e.addClass('array');
      } else {
        $e.addClass('object');
      }
    }
    outputAsString = this._resultToString(output);
    $e.text(outputAsString);
    $output.prepend($e);
    setTimeout(function() {
      return $e.addClass('visible');
    }, 100);
    return $e;
  };

  CoffeeScriptConsole.prototype.init = function() {
    var $input, $output, self;
    $output = this.$output;
    $input = this.$input;
    self = this;
    $input.on('keyup', function(e) {
      var code, linesCount;
      code = $(this).val();
      if ((e.keyCode === 13 && e.shiftKey) || e.keyCode === 8) {
        linesCount = code.split('\n').length;
        return self._adjustTextareaHeight($input);
      }
    });
    return $input.on('keydown', function(e) {
      var $e, code, cursorPosition, js, linesCount, originalCode, output, _ref, _ref1;
      code = originalCode = $(this).val();
      cursorPosition = $input.get(0).selectionStart;
      linesCount = code.split('\n').length;
      if (code.trim() !== self._lastPrompt) {
        $(this).removeClass('error');
      }
      if (e.keyCode === 9) {
        e.preventDefault();
        self._insertAtCursor($input, '  ');
      } else if (e.keyCode === 38) {
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
        self._setCursorToEnd(e, $(this));
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
        try {
          js = CoffeeScript.compile(code, {
            bare: true
          });
          output = eval.call(window, js);
          $(this).val('');
          self._currentHistoryPosition = null;
          self.addToHistory(code);
          $e = self.echo(output);
          $e.addClass('evalOutput');
          if (self._resultToString(output) === '') {
            return;
          }
          self.onAfterEvaluate(output, $e);
        } catch (_error) {
          e = _error;
          $input.addClass('error');
          $e = self.echo(e);
          $e.addClass('evalOutput');
          self.onCodeError(e, $e);
        }
      }
      if (typeof code === 'string') {
        self._lastPrompt = code.trim();
      }
      return self._adjustTextareaHeight($(this));
    });
  };

  CoffeeScriptConsole.prototype.onAfterEvaluate = function(output, $e) {};

  CoffeeScriptConsole.prototype.onCodeError = function(error, $e) {};

  return CoffeeScriptConsole;

})();

/*
//@ sourceMappingURL=csc.map
*/
