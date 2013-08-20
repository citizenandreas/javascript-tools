
var mainTest = function () {
    var i;
    var testData = new Array();

    for (var i = 0; i < 1000; i++) {
        var data;
        if (i % 4 === 0) {
            data = { index: i, item: "Carpet" };
        } else if (i % 4 === 1) {
            data = { index: i, item: "House" };
        } else if (i % 4 === 2) {
            data = { index: i, item: "Cat" };
        } else if (i % 4 === 3) {
            data = { index: i, item: "Shotgun" };
        }
        testData.push(data);
    }

    var countMethod = function (callback) {
        callback(1000);
    };

    var dataMethod = function (from, to, callback) {
        var returnData = new Array();
        for (var i = from, j = to; i <= j; i++) {
            returnData.push(testData[i]);
        }
        callback(returnData);
    };

    var settings = {
        BufferSize: 100,
        BufferCount: 3,
        ChunkSize: 10
    };

    var charcoal = blackvoid.testing.charcoal;
    var writer = charcoal.output.ConsoleWriter;
    var test = new charcoal.TestInstance(writer);
    var loadModes = blackvoid.tools.BufferLoadModes;
    var cacheTool;
    var buffer;

    test.AddTest("Create Buffer", function (callback) {
        buffer = new blackvoid.tools.AutoLoadingBuffer(5, 10, loadModes.Forward, dataMethod);
        buffer.GetData(5, 6, function (data) {
            test.Assert(data.length === 2, "Length should be equal to 2");
            test.Assert(data[0].index !== undefined, "returned data item 0 should have an index property");
            test.Assert(data[0].index === 5, "returned data item 0 should have an index of 5");
            test.Assert(data[0].item !== undefined, "returned data item 0 should have an item property");
            test.Assert(data[0].item === "House", "returned data item 0 should have an item of 'House'");
            callback();
        });
    });

    test.AddTest("Create Cache", function (callback) {
        cacheTool = new blackvoid.tools.MultiCache(countMethod, dataMethod, settings);
        callback();
    });

    test.AddTest("Test Retrieval", function (callback) {
        

        cacheTool.GetData(0, 9, function (data) {
            callback();
        });        
    });


    test.RunTests();

};

mainTest();