class CoffeeScriptConsole

  # options
  outputContainer: '<pre class="outputResult"></pre>'
  echoEvalOutput: true
  storeInput: true
  storeOutput: true
  adjustInputHeightUnit: 'em' #use em

  constructor: (options = {}) ->
    unless $?
      throw Error('jQuery is required to use CoffeeScriptConsole');
    # apply default values
    options.$input ?= $('#consoleInput')
    options.$output ?= $('#consoleOutput')
    @history = store.get('CoffeeScriptConsole_history') or [] if store and @storeInput
    @suggestions = []
    # apply options on object
    for attr of options
      @[attr] = options[attr]
    if store and @storeOutput
      outputHistory = store.get('CoffeeScriptConsole_output') or []
      for o in outputHistory
        @echo o.output, o.classification, false
    @init()

  lastCommand: ->
    history[history.length] or null

  history: null #[]
  suggestions: null #[]

  _currentHistoryPosition: null

  addToHistory: (command) ->
    command = command?.trim()
    if command
      return if @history[@history.length-1] and @history[@history.length-1] is command
      @history.push(command)
    store.set('CoffeeScriptConsole_history', @history) if store and @storeInput

  historySuggestionsFor: (term) ->
    term = String(term).trim()
    suggestions = []
    # shallow copy of array, reverse and add suggestions
    history = [].concat(@history).reverse().concat(@suggestions)
    unless term is ''
      for command in history
        s = String(command).trim()
        # only add if differs from command and begin is identical
        # and if it's not already added
        if s isnt '' and s isnt term and s.substring(0, term.length) is term and suggestions.indexOf(s) is -1
          suggestions.push(s)
    suggestions

  clearHistory: ->
    @clearOutputHistory()
    @clearInputHistory()

  clearInputHistory: ->
    @history = []
    store.set('CoffeeScriptConsole_history', @history) if store and @storeInput

  clearOutputHistory: ->
    store.set('CoffeeScriptConsole_output', []) if store and @storeOutput

  _lastPrompt: ''
  _objectIsError: (o) ->
    # EvalError, RangeError, ReferenceErrorl SyntaxError, TypeError, URIError
    if o and typeof o.message isnt 'undefined' then true else false

  _resultToString: (output) ->
    if typeof output is 'object' and output isnt null
      if output.constructor is Array
        json2html(output)
        #JSON.stringify output
      else if @_objectIsError(output)
        output.message
      else
        json2html(output)
        #JSON.stringify output, null, '  '
    else if output is undefined
      'undefined'
    else if typeof output is 'function'
      return output.toString()
    else if String(output).trim() is ''
      ''
    else
      output

  _setCursorToEnd: (e, $e) ->
    e.preventDefault()
    $e.get(0).setSelectionRange $e.val().length, $e.val().length

  _setCursorToStart: (e, $e) ->
    e.preventDefault()
    $e.get(0).setSelectionRange $e.val().split('\n')?[0].length, $e.val().split('\n')?[0].length

  _insertAtCursor: ($e, myValue) ->
    myField = $e.get(0)
    #IE support
    if document.selection
      temp = undefined
      myField.focus()
      sel = document.selection.createRange()
      temp = sel.text.length
      sel.text = myValue
      if myValue.length is 0
        sel.moveStart "character", myValue.length
        sel.moveEnd "character", myValue.length
      else
        sel.moveStart "character", -myValue.length + temp
      sel.select()

    #MOZILLA/NETSCAPE support
    else if myField.selectionStart or myField.selectionStart is 0
      startPos = myField.selectionStart
      endPos = myField.selectionEnd
      myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length)
      myField.selectionStart = startPos + myValue.length
      myField.selectionEnd = startPos + myValue.length
    else
      myField.value += myValue

  _adjustTextareaHeight: ($e, lines = null) ->
    if lines is null
      lines = $e.val().split('\n').length
    if @adjustInputHeightUnit
      $e.css 'height', (lines*1.5)+@adjustInputHeightUnit
    else
      $e.attr 'rows', lines




  _keyIsTriggeredManuallay: false

  echo: (output, classification, doStore) ->
    doStore = @storeOutput if typeof doStore isnt 'boolean'
    $e = $(@outputContainer)
    $output = @$output
    cssClass = ''
    if typeof classification is 'string' and classification isnt 'evalOutput'
      cssClass = classification
      # skip if we don't display output of eval
      $e.addClass(cssClass)
    else
      return $e if classification is 'evalOutput' and not @echoEvalOutput
      if typeof output is 'function'
        cssClass = 'function'
      else if typeof output is 'number'
        cssClass = 'number'
      else if typeof output is 'boolean'
        cssClass = 'boolean'
      else if typeof output is 'string'
        cssClass = 'string'
      else if output is undefined
        cssClass = 'undefined'
      else if typeof output is 'object'
        if @_objectIsError(output)
          cssClass = 'error'
        else if output is null
          cssClass = 'null'
        else if output?.constructor is Array
          cssClass = 'array'
        else
          cssClass = 'object'
    if cssClass
      $e.addClass(cssClass)
    if store and doStore
      history = store.get('CoffeeScriptConsole_output') or []
      history.push output: @_resultToString(output) , classification: cssClass
      store.set('CoffeeScriptConsole_output', history)
    outputAsString = @_resultToString(output)
    if /^\<.+\>/.test(outputAsString)
      $e.html outputAsString
    else
      $e.text outputAsString
    $output.prepend $e
    setTimeout ->
      $e.addClass 'visible'
    , 100
    return $e

  init: ->
    $output = @$output
    $input = @$input
    self = @
    # TODO: split function in many functions
    $input.on 'keyup', (e) ->
      code = $(@).val()
      cursorPosition = $input.get(0).selectionStart
      # enter+shift or backspace
      # if ( e.keyCode is 13 and e.shiftKey ) or e.keyCode is 8
      # always check lines
      linesCount = code.split('\n').length#if code.match(/\n/g)?.length > 0 then code.match(/\n/g).length else 1
      self._adjustTextareaHeight($input)
      # tab pressed
      if e.keyCode is 9 and cursorPosition isnt code.length
        self._insertAtCursor $input, '  '

    suggestionFor = null
    suggestionNr = 0

    $input.on 'keydown', (e) ->
      code = originalCode = $(@).val()
      cursorPosition = $input.get(0).selectionStart
      linesCount = code.split('\n').length

      if code.trim() isnt self._lastPrompt
        $(@).removeClass 'error'
      # tab pressed
      if e.keyCode is 9
        e.preventDefault()
        if cursorPosition is code.length
          if suggestionFor is null
            suggestionFor = code
          suggestions = self.historySuggestionsFor(suggestionFor)
          if suggestions[suggestionNr]
            $(@).val(suggestions[suggestionNr])
            if suggestionNr+1 <= suggestions.length
              suggestionNr++
            else
              suggestionNr = 0
              $(@).val('')

        else
          suggestionFor = null
          suggestionNr = 0
      else
        suggestionFor = null
        suggestionNr = 0
      # up
      if e.keyCode is 38
        # only browse if cursor is on first line
        return unless cursorPosition <= originalCode.split("\n")?[0]?.length
        return if self._currentHistoryPosition is 0
        if self._currentHistoryPosition is null
          self._currentHistoryPosition = self.history.length
        self._currentHistoryPosition--
        code = self.history[self._currentHistoryPosition]
        $(@).val(code)
        self._setCursorToStart(e, $(@))
      # down
      else if e.keyCode is 40 and self._currentHistoryPosition >= 0
        # only browse if cursor is on last line
        return unless cursorPosition >= originalCode.split("\n").splice(0,linesCount).join(' ').length
        if self._currentHistoryPosition is null
          self._currentHistoryPosition = self.history.length-1
        else if self.history.length is (self._currentHistoryPosition+1)
          self._currentHistoryPosition = null
          $(@).val('')
          return
        self._currentHistoryPosition++
        code = self.history[self._currentHistoryPosition] or ''
        $(@).val(code)
        self._setCursorToEnd(e, $(@))
        unless code
          self._currentHistoryPosition = null
          return
      # enter pressed
      else if e.keyCode is 13 and not e.shiftKey#ctrlKey
        e.preventDefault()
        self.executeCode()
      if typeof code is 'string'
        self._lastPrompt = code.trim()
      self._adjustTextareaHeight($(@))

  executeCode: (code = @$input?.val(), $input = @$input) ->
    # execute code
    try
      # output = CoffeeScript.eval code, sandbox: @
      js = CoffeeScript.compile code, bare: true
      output = eval.call window, js
      $input.val('')
      @_currentHistoryPosition = null
      @addToHistory(code)
      $e = @echo(output, 'evalOutput')
      return if @_resultToString(output) is ''
      @onAfterEvaluate output, $e
    catch e
      $input.addClass 'error'
      $e = @echo(e, 'evalOutput')
      @onCodeError e, $e

  onAfterEvaluate: (output, $e) ->

  onCodeError: (error, $e) ->
