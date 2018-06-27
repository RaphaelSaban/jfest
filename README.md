# jfest
Test is about data. Why write more code to test code? We want to see our code alive while writing it and feed it with data.

Zero test files, zero configuration, zero dependencies. Just your code.

**jfest** is a lightweight command-line tool that automates your unit tests for JavaScript. It watches your `.js` files, tracks your function calls and safely executes them to show you the results. Writing or modifying a function? Use `$test` to see its returned values. If you have saved a previous execution, you'll even get a regression check. Happy with the results? Rename `$test` to `$save` and your test cases are now persistent. Finally, remove all `$test` and `$save` from your files. Your tests are safe, your code is clean.

**jfest** embraces what makes you code faster and safer: test driven development (TDD), functional programming, stateless, function as a service.

It also supports object oriented programming to some extent. Objects can be mocked the same way functions can be faked.

# Getting Started

#### Install the `jfest` command

```sh
npm install -g jfest
```

#### Run your first test with `jfest`

In your project's root directory:

```sh
user@dev:~/my/javascript/project/$ jfest
-- watching /home/user/my/javascript/project
--Cache loaded (0 function calls)
```

Add a `$test` in a `.js` file of your choice and save:

```js
function foo ( bar ) {
    return bar + 1;
}

function $test() {
    foo(1);
    foo("a");
}
```

#### Check results in console

Results are displayed like this in two blocks:

- test case status: `+` for new, `=` for same result, `!` for regression
- function name
- `this` object in brackets
- values of arguments
- `[new]` returned value
- `[old]` expected value (omitted if new test case)

First block stands for regression tests from previous saves. Second block is for tests written in `$test` or `$save`.

```sh
foo.js change
Validating 'foo'
News[0] Successes[0] Errors[0]
+ foo[null](1) [new] 2
+ foo[null]("a") [new] "a1"
News[2] Successes[0] Errors[0]
```

#### Save results

Change `$test` to `$save` in that file and save:

```js
function foo ( bar ) {
    return bar + 1;
}

function $save() {
    foo(1);
    foo("a");
}
```

#### Introduce a regression

Remove any `$test` or `$save` from that file, modify your function (e.g. `1` becomes `"1"`) and save:

```js
function foo ( bar ) {
    return bar + "1";
}
```

#### Check new results in console

In the regression tests, we see the function now returns `"11"` instead of `2`:

```sh
foo.js change
Validating 'foo'
= foo[null]("a") [new] "a1" [old] "a1"
! foo[null](1) [new] "11" [old] 2
News[0] Successes[1] Errors[1]
News[0] Successes[0] Errors[0]
```
# Features and limitations

Your interactions with jfest are just the `$test` and `$save` functions.

`$test` and `$save` are run as functions. So you can put in their body whatever code is useful for your tests. Keep in mind that they are temporary functions. After you have used them, you can remove them. Also, their location in your file does not matter.
When you use `$save`, jfest creates a `jfest.calls` JSON file in the running directory. Once saved, function calls are used to fake similar function calls or check for regressions.

**jfest runs your functions, not your files**. To keep it simple, jfest considers all your functions are global.

So you should:
- not reference global variables (ignored by jfest) in a function under test
- use unique function names across all your project

Coming features:
- give names to test cases (as arguments of `$save`) - so you get a verbose context of saved function calls
- do not fake specific functions - some functions are expected to return different results (like `random()` or `Date()`)
