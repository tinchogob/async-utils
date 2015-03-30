/* Caolan's async.apply method
 * that ignore errors and returns undefined
 * hence applyIE (as in apply Ignore Errors)
 * Additionally it logs the error for future
 * traceability
 * WARNING: this only works for callback ending argument functions
 * which are standard with async so it should be this way
 */
module.exports.applyIE = function applyIE() {

    var args = Array.prototype.slice.call(arguments, 0);

    var fx = args.shift();

    /* This is the function that async will call
     * Callback is async's callback that expects an error or a response
     */
    return function wrapped_fx() {

        var wrapped_fx_args = Array.prototype.slice.call(arguments, 0);
        
        var callback = wrapped_fx_args.pop();

        wrapped_fx_args.forEach(args.push, args);

        /* This function is the callback that will be called by the user
         * It's used as a proxy for the async callback that ignores the
         * errors.
         */
        args.push(function ignore_error_cb(error, returnValue) {
            if (error) {
                return callback();
            }
            return callback(undefined, returnValue);
        });

        //call the user function with the callback proxied.
        fx.apply(fx, args);
    };
};

/* Callback interceptor to avoid one line ifs
 * EXAMPLE:
 *
 *  service.get('sth', intercept(callback, function(response) {
 *      //handle response, if an error happens callback will be called with that error
 *  }))
 *
 */
module.exports.intercept = function intercept(interceptor, real_callback) {
    return function callback_interceptor(error, response) {
        if (error) {
            return interceptor(error);
        }
        return real_callback(response);
    };
};

/* Interface to use async.auto with nice function signature
 * EXAMPLE:
 *
 *  var _getArg3 = function(arg1, arg2, cb) {};
 *
 *  async.auto({
 *      arg1: _getArg1,
 *      arg2: _getArg2,
 *      arg3: applyAuto([arg1, arg2, _getArg3])
 *  }, onFinish);
 */
module.exports.applyAuto = function(definition) {

    var fx = definition.pop();
    var fx_args = JSON.parse(JSON.stringify(definition));

    if (typeof fx !== 'function') {
        throw new Error('Invalid auto definition');
    }

    var interface_args = [];

    var interface_fx = function interface_fx(cb, autoResults) {
        fx_args.forEach(function(fx_dependency) {
            var arg = autoResults[fx_dependency];
            interface_args.push(arg);
        });

        interface_args.push(cb);

        return fx.apply(undefined, interface_args);
    };

    definition.push(interface_fx);

    return definition;

};