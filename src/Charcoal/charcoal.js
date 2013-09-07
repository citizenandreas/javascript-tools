/*****************************************************************

    Charcoal - A javascript testing framework
    Copyright 2013 Andreas Paterson

******************************************************************/

if (typeof blackvoid === "undefined") {
    var blackvoid = {};
}

if (blackvoid.testing === undefined) {
    blackvoid.testing = {};
}

(function () {
    blackvoid.testing.charcoal = {};
    blackvoid.testing.charcoal.output = {};
    blackvoid.testing.charcoal.output.ConsoleWriter = {
        Write: function (message) {
            console.log(message);
        }
    };

    blackvoid.testing.charcoal.TestInstance = function (_output, _verbose) {
        if (_verbose === undefined)
            _varbose = false;

        var _testResult = true;
        var _failedAssertions = 0;
        var _successfulAssertions = 0;
        var _unhandledExceptions = 0;
        var _testNames = new Array();
        var _testFunctions = new Array();
        var _success = true;

        this.AddTest = function (name, func) {
            _testNames.push(name);
            _testFunctions.push(func);
        };

        this.Assert = function (condition, message) {
            if (condition === true) {
                _successfulAssertions++;
                if (_verbose) {
                    _output.Write("Passed:" + message);
                }
            } else if (condition === false) {
                _failedAssertions++
                _testResult = false;
                _output.Write("Failed:" + message);
            } else {
                _output.Write("Unknown Result:" + message);
            }
        };

        this.Equals = function (testValue, expectedValue, message) {
            if (testValue === expectedValue) {
                _successfulAssertions++;
                if (_verbose) {
                    _output.Write("Passed:" + message + " expected " + expectedValue + " got " + testValue);
                }
            } else {
                _testResult = false;
                _failedAssertions++
                _output.Write("Failed:" + message + " expected " + expectedValue + " got " + testValue);
            }
        }

        this.Log = function (message) {
            _output.Write(message);
        }

        this.RunTests = function () {
            var i = 0;
            var runTest = function () {
                try {
                    if (i < _testFunctions.length) {
                        if (_verbose) {
                            _output.Write("Running:" + _testNames[i]);
                        }
                        _testFunctions[i](function () {
                            if (_verbose) {
                                _output.Write("Finished:" + _testNames[i]);
                            }
                            i++;
                            runTest();
                        });
                    } else {
                        _output.Write("Finished All Tests:" + _successfulAssertions + " successful assertion(s), " 
                            + _failedAssertions + " failed assertion(s), "
                            + _unhandledExceptions + " unhandled exception(s)");
                        if (_testResult) {
                            _output.Write("Test Successful");
                        } else {
                            _output.Write("Test Failed");
                        }
                    }
                } catch (e) {
                    _output.Write("Error Executing Test");
                    _unhandledExceptions++;
                    _testResult = false;
                    if (e) {
                        if (e.message) {
                            _output.Write(e.message);
                        }

                        if (e.stack) {
                            _output.Write(e.stack);
                        }
                    }
                    i++;
                    runTest();
                }
            };
            runTest();
        }
    }
})();

/* For Node.js use */
if (typeof exports === "undefined") {
    var exports = {};
}
exports.charcoal = blackvoid.testing.charcoal;