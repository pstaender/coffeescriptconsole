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

  * press `enter` to evaluate code
  * press `shift+enter` to insert new line(s)
  * press `keyup`/`keydown` to browse through history
  * use `echo()` instead of `console.log()` to echo

### What's implemented so far

  * executing coffeescript code in current environment
  * echo ”styled“ output
  * browser through input history

### What's missing

  * syntax highlighting
  * autocompletion
  * package.json, tests …

Only tested on Chrome (v27+), but should also run on other modern browsers.
