window.usage = ->
  s = """
  # CoffeeScriptConsole

    * press `shift+enter` to insert new line(s)
    * press `keyup`/`keydown` to browse through history
    * use `echo()` instead of `console.log()` to echo
    * `clearHistory()` clears console history
    * `clear()` clears screen
    * `echoEvalOutput(true|false)` echo result of executed code

  ## Keyboard Shortcuts

    * `cmd+k` clear output screen
    * `cmd+shift+k` toggle echo eval output
  """

$(window).ready ->

  $consoleDashboard = $("#consoleDashboard")
  $input = $("#consoleInput")
  $output = $("#consoleOutput")

  csc = new CoffeeScriptConsole(
    $input: $input
    $output: $output
    suggestions: "usage(),clearHistory(),clearScreen(),echoEvalOutput(true),echo,clear()".split(",")
  )

  window.puts = window.echo = (output) ->
    csc.echo output

  window.clearHistory = ->
    csc.clearHistory()

  window.clear = ->
    window.clearScreen()
    csc.clearOutputHistory()

  window.clearScreen = ->
    csc.$output.html ""

  window.echoEvalOutput = (trueOrFalse) ->
    if typeof trueOrFalse is "boolean"
      $flag = $("#consoleDashboard .echoEvalOutput i")
      if trueOrFalse
        $flag.addClass "icon-eye"
        $flag.removeClass "icon-eye-off"
      else
        $flag.addClass "icon-eye-off"
        $flag.removeClass "icon-eye"
      csc.echoEvalOutput = trueOrFalse
      store.set "echoEvalOutput", trueOrFalse  if store

  window.echoEvalOutput (if typeof store.get("echoEvalOutput") is "boolean" then store.get("echoEvalOutput") else true)  if store
  window.load = (url, cb) ->
    $.getScript url, cb

  toggleEchoEvalOutput = ->
    window.echoEvalOutput not csc.echoEvalOutput

  $(document).on "keydown", (e) ->
    $("#consoleInput").focus() # TODO: replace with less resource intensive check
    # cmd + k, clear console
    if (e.keyCode is 75 and e.metaKey) or (e.keyCode is 75 and e.ctrlKey)

      # cmd + k + shift, toggle echo eval output
      if e.shiftKey
        toggleEchoEvalOutput()
      else
        window.clear()

  $iconDark = $consoleDashboard.find("i.icon-ajust")
  $iconDark.on "click", ->
    $("body").toggleClass "dark"
    store.set "darkColorTheme", $("body").hasClass("dark")

  $consoleDashboard.find("i.icon-eye, i.icon-eye-off").on "click", ->
    toggleEchoEvalOutput()

  if store
    window.echoEvalOutput store.get("echoEvalOutput")
    $iconDark.trigger "click"  if store.get("darkColorTheme")
  $("#consoleOutput .outputResult").live "click", (e) ->
    if $(e.target).hasClass("attribute") or $(e.target).hasClass("value")
      $input.val $(e.target).html()
    else

      #
      $input.val $(this).data("outputString")
    $input.focus()

  $("#consoleOutput .outputResult").live "dblclick", (e) ->
    $input.val $(this).data("code")
    $input.focus()

  $("#consoleOutput .outputResult i.icon-cancel").live "click", ->
    $e = $(this).parent()

    # console.log($e.data('position'));
    csc.removeFromOutputHistory $e.data("position")
    $e.remove()

