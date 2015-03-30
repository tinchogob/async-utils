# async-utils [![Build Status](https://travis-ci.org/tinchogob/async-utils.png)](https://travis-ci.org/tinchogob/async-utils)

Node complementary utils for Caolan async's module

### applyIE (as in apply Ignore Errors)
Caolan's async.apply method that ignore errors and yields undefined.
WARNING: this only works for callback ending argument functions
which are standard with async so it should be ok.
It helps to stop async to cancel tasks if one fails

Example: 
```javascript
var asyncUtils = require('async-utils');

var yield_error = function(name, cb) {
  //name === 'tom'
  cb(new Error('ignored error');
};

var applied_fx = asyncUtils.applyIE(yield_error, 'tom');

applied_fx(function(error) {
  //error is undefined
  //continue processing after ignoring the error
});
```

### intercept (as in intercept error callbacks)
Callback interceptor to avoid one line error check ifs

Example: 
```javascript
var asyncUtils = require('async-utils');

var yield_error = function(cb) {
  cb(new Error('yielded error');
};

function process(callback) {
  yield_error(asyncUtils.intercept(callback, function() {
    //this code never get executed, instead callback was called with yielded error
  }));
}
```
