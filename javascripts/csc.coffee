class CoffeeScriptConsole

  outputContainer: '<pre class="outputResult"></pre>'

  lastCommand: ->
    history[history.length] or null
  history: []
  _currentHistoryPosition: null
  addToHistory: (command) ->
    command = command?.trim()
    if command
      return if @history[@history.length-1] and @history[@history.length-1] is command
      @history.push(command)
    store.set('CoffeeScriptConsole_history', @history) if store

  _lastPrompt: ''

  _resultToString: (output) ->
    if typeof output is 'object' and output isnt null
      if output.constructor is Array
        JSON.stringify output
      else if output.constructor is Error
        output.message
      else
        JSON.stringify output, null, '  '
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
    $e.css 'height', lines+'em'

  constructor: (options = {}) ->
    unless $?
      throw Error('jQuery is required to use CoffeeScriptConsole');
    # apply default values
    options.$input ?= $('#consoleInput')
    options.$output ?= $('#consoleOutput')
    @history = store.get('CoffeeScriptConsole_history') or [] if store
    # apply options on object
    for attr of options
      @[attr] = options[attr]
    @init()

  _keyIsTriggeredManuallay: false

  echo: (output) ->
    $output = @$output
    $e = $(@outputContainer)
    if typeof output is 'function'
      if typeof output.constructor is Error
        $e.addClass 'error'
      else
        $e.addClass 'function'
    else if typeof output is 'number'
      $e.addClass 'number'
    else if typeof output is 'boolean'
      $e.addClass 'boolean'
    else if typeof output is 'string'
      $e.addClass 'string'
    else if output is undefined
      $e.addClass 'undefined'
    else if typeof output is 'object'
      if output is null
        $e.addClass 'null'
      else if output?.constructor is Array
        $e.addClass 'array'
      else
        $e.addClass 'object'
    outputAsString = @_resultToString(output)
    $e.text outputAsString
    # console.log outputAsString, $output
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
      # enter+shift or backspace
      if ( e.keyCode is 13 and e.shiftKey ) or e.keyCode is 8
        linesCount = code.split('\n').length#if code.match(/\n/g)?.length > 0 then code.match(/\n/g).length else 1
        self._adjustTextareaHeight($input)
    $input.on 'keydown', (e) ->
      code = originalCode = $(@).val()
      cursorPosition = $input.get(0).selectionStart
      linesCount = code.split('\n').length
      if code.trim() isnt self._lastPrompt
        $(@).removeClass 'error'
      # tab pressed
      if e.keyCode is 9
        e.preventDefault()
        self._insertAtCursor $input, '  '
      # up
      else if e.keyCode is 38
        # only browse if cursor is on first line
        return unless cursorPosition <= originalCode.split("\n")?[0]?.length
        return if self._currentHistoryPosition is 0
        if self._currentHistoryPosition is null
          self._currentHistoryPosition = self.history.length
        self._currentHistoryPosition--
        code = self.history[self._currentHistoryPosition]
        $(@).val(code)
        self._setCursorToEnd(e, $(@))
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
        # execute code
        try
          # output = CoffeeScript.eval code, sandbox: @
          js = CoffeeScript.compile code, bare: true
          output = eval.call window, js
          $(@).val('')
          self._currentHistoryPosition = null
          self.addToHistory(code)
          $e = self.echo(output)
          $e.addClass 'evalOutput'
          return if self._resultToString(output) is ''
          self.onAfterEvaluate output, $e
        catch e
          $input.addClass 'error'
          $e = self.echo(e)
          $e.addClass 'evalOutput'
          self.onCodeError e, $e

      if typeof code is 'string'
        self._lastPrompt = code.trim()
      self._adjustTextareaHeight($(@))

  onAfterEvaluate: (output, $e) ->

  onCodeError: (error, $e) ->
