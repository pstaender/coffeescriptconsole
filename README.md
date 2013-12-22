## CoffeeScript Console

[Check out the demo](http://pstaender.github.io/coffeescriptconsole)

### Usage

Ensure that jQuery is included (is required by csc) and init with `$input` and `$output` DOM-element:

```js
  new CoffeeScriptConsole({
    $input: $('#consoleInput'),
    $output: $('#consoleOutput'),
  });
```

### Commands

  * press `shift+enter` to insert new line(s)
  * press `keyup`/`keydown` to browse through prompt history
  * use `echo()` instead of `console.log()` to echo
  * `clearHistory()` clears console history
  * `clear()` clears screen
  * `echoEvalOutput(true|false)` echo result of executed code

### Keyboard Shortcuts

  * `⌘+k` / `ctrl+k` clear output screen
  * `⌘+shift+k` / `ctrl+shift+k` toggle echo eval output
  * `tab` for autocomplete

### Use console output

  * **click on a result block** will put the result to the prompt
  * **doubleclick on a result block** will put the original prompt back to the input
  * **click on JSON attributes or values** will put the value to the prompt

### Await Async in one line

Define a variable with a `*`-prefix to await async (expects `err, result` argument sequence):

```coffeescript
  *res = $.get 'http://google.com'
  echo res
```

Since [IcedCoffeeScript](http://maxtaco.github.io/coffee-script/) is used by default, you can also use the `await defer`-syntax (`*` above is just a shortcut for this):

```coffeescript
  res = $.get 'http://google.com', defer res
  echo res
```

### Options

In the bottom right you can toggle the evaluated output (same as with `⌘+shift+k`) and toggle betweem dark and light theme.

### What's implemented so far

  * executing (iced-)coffeescript code in global environment
  * ”styled“ array and json output
  * prompt history including autocomplete

### What's missing

  * package.json, tests …
  * implement require

Just tested on Chrome (v27+) and Firefox (v24+) so far, but should work fine on other modern browsers (like Safari, iExplorer 10+ …)
