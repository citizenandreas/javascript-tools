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

    blackvoid.testing.charcoal.TestInstance = function (output) {
        var testNames = new Array();
        var testFunctions = new Array();
        var success = true;

        this.AddTest = function (name, func) {
            testNames.push(name);
            testFunctions.push(func);
        };

        this.Assert = function (condition, message) {
            if (condition === true) {
                output.Write("Passed:" + message);
            } else if (condition === false) {
                output.Write("Failed:" + message);
            } else {
                output.Write("Unknown Result:" + message);
            }
        };

        this.RunTests = function () {
            var i = 0;
            var runTest = function () {
                try {
                    if (i < testFunctions.length) {
                        output.Write("Running:" + testNames[i]);
                        testFunctions[i](function () {
                            output.Write("Finished:" + testNames[i]);
                            i++;
                            runTest();
                        });
                    } else {
                        output.Write("Finished All Tests");
                    }
                } catch (e) {
                    output.Write("Error Executing Test");
                    if (e) {
                        if (e.message) {
                            output.Write(e.message);
                        }

                        if (e.stack) {
                            output.Write(e.stack);
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