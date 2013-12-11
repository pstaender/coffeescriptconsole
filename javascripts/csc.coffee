class CoffeeScriptConsole

  lastCommand: ->
    history[history.length] or null
  history: []
  _currentHistoryPosition: null
  addToHistory: (command) ->
    command = command?.trim()
    if command
      return if @history[@history.length-1] and @history[@history.length-1] is command
      @history.push(command)

  _lastPrompt: ''
  _resultToString: (output) ->
    if typeof output is 'object' and output isnt null
      JSON.stringify output, null, '  '
    else if output is undefined
      'undefined'
    else if typeof output is 'function'
      return output.toString()
    else if String(output).trim() is ''
      ''
    else
      output

  constructor: (options = {}) ->
    unless $?
      throw Error('jQuery is required to use CoffeeScriptConsole');
    # apply default values
    options.$input ?= $('#consoleInput')
    options.$output ?= $('#consoleOutput')
    # apply options on object
    for attr of options
      @[attr] = options[attr]
    @init()

  _keyIsTriggeredManuallay: false

  init: ->
    $output = @$output
    $input = @$input
    self = @
    # TODO: split function in many functions
    $input.on 'keyup', (e) ->
      code = $(@).val()
      # enter+shift or backspace
      if ( e.keyCode is 13 and e.shiftKey ) or e.keyCode is 8
        #e.preventDefault() unless e.keyCode is 8
        linesCount = code.split('\n').length#if code.match(/\n/g)?.length > 0 then code.match(/\n/g).length else 1
        $input.css 'height', linesCount+'em'
    $input.on 'keydown', (e) ->
      code = $(@).val()
      if code.trim() isnt self._lastPrompt
        $(@).removeClass 'error'
      # tab pressed
      if e.keyCode is 9
        e.preventDefault()
        insertAtCursor @, '  '
      # up
      else if e.keyCode is 38
        return if self._currentHistoryPosition is 0
        if self._currentHistoryPosition is null
          self._currentHistoryPosition = self.history.length
        self._currentHistoryPosition--
        code = self.history[self._currentHistoryPosition]
        $(@).val(code)
      # down
      else if e.keyCode is 40 and self._currentHistoryPosition >= 0
        if self._currentHistoryPosition is null
          self._currentHistoryPosition = self.history.length-1
        else if self.history.length is (self._currentHistoryPosition+1)
          self._currentHistoryPosition = null
          $(@).val('')
          return
        self._currentHistoryPosition++
        code = self.history[self._currentHistoryPosition] or ''
        $(@).val(code)
        unless code
          self._currentHistoryPosition = null
          return
      # enter pressed
      else if e.keyCode is 13 and not e.shiftKey#ctrlKey
        e.preventDefault()
        # execute code
        $e = $('<pre class="outputResult"></pre>')
        try
          # output = CoffeeScript.eval code, sandbox: @
          js = CoffeeScript.compile code, bare: true
          output = eval.call window, js
          $(@).val('')
          if typeof output is 'function'
            $e.addClass 'function'
          else if output is undefined
            $e.addClass 'undefined'
          else if output is null
            $e.addClass 'null'
          self._currentHistoryPosition = null
          self.addToHistory(code)
          outputAsString = self._resultToString(output)
          return if outputAsString is ''
          $e.text outputAsString
          self.onAfterEvaluate output, $e
        catch e
          $input.addClass 'error'
          $e.text e?.message or e
          $e.addClass 'error'
          self.onCodeError e, $e
        $output.prepend $e
      self._lastPrompt = code.trim()

  onAfterEvaluate: (output, $e) ->
    setTimeout ->
      $e.addClass 'visible'
    , 200

  onCodeError: (e, $e) ->
    setTimeout ->
      $e.addClass 'visible'
    , 200
