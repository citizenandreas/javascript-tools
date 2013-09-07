
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
    var charcoal = blackvoid.testing.charcoal;
    var writer = charcoal.output.ConsoleWriter;
    var test = new charcoal.TestInstance(writer,false);
    var loadModes = blackvoid.tools.BufferLoadModes;
    var cacheTool;
    var chunkRec;
    var buffer;

    test.AddTest("Create Test Chunk Recorder", function (callback) {
        chunkRec = new blackvoid.tools.DataChunkRecorder(1, 50);
        // Test that duplicate chunks are disposed of appropriately
        chunkRec.AddChunk(10, 19);
        test.Log(chunkRec.DebugOutput());
        chunkRec.AddChunk(10, 19);
        test.Log(chunkRec.DebugOutput());
        test.Equals(chunkRec.GetChunkCount(), 1, "Chunk Count Should Be 1");
        // Add 2 chunks, as they are contiguous they should combine in to one chunk 10-29
        chunkRec.AddChunk(20, 29);
        test.Log(chunkRec.DebugOutput());
        var chunkResult = chunkRec.GetDataNeededRange(15, 20);
        test.Assert(chunkResult === null, "Chunk Result Should Be Null");
        test.Equals(chunkRec.GetMax(), 29, "Chunk Max");
        test.Equals(chunkRec.GetMin(), 10, "Chunk Min");
        test.Equals(chunkRec.GetChunkCount(), 1, "Chunk Count Should Be 1");

        // Add a second chunk, this one will be a separate chunk as it is not countiguous
        // Giving us two chunks 10-29 and 40-50
        chunkRec.AddChunk(40, 50);
        test.Log(chunkRec.DebugOutput());
        chunkResult = chunkRec.GetDataNeededRange(5, 20);

        // Since 5 is below any existing chunks it is the start point
        // we should be told we just need to get the records 5-9 as 
        // those 10-29 are already present
        test.Equals(chunkResult.from, 5, "Chunk Result.From");
        test.Equals(chunkResult.to, 9, "Chunk Result.To");
        test.Equals(chunkRec.GetMax(), 50, "Chunk Max");
        test.Equals(chunkRec.GetMin(), 10, "Chunk Min");
        test.Equals(chunkRec.GetChunkCount(), 2, "Chunk Count");

        //Add an overlapping chunk,this should join to give us 10-50 in one chunk
        chunkRec.AddChunk(29, 41);
        test.Log(chunkRec.DebugOutput());
        test.Equals(chunkRec.GetChunkCount(),1, "Chunk Count");
        test.Equals(chunkRec.IsLoaded(),false, "Chunk IsLoaded");

        // Now complete the chunk set
        chunkRec.AddChunk(1, 11);
        test.Log(chunkRec.DebugOutput());
        test.Equals(chunkRec.GetChunkCount(), 1, "Chunk Count");
        test.Equals(chunkRec.IsLoaded(), true, "Chunk IsLoaded");

        var chunkRec2 = new blackvoid.tools.DataChunkRecorder(1, 50);
        chunkRec2.AddChunk(1, 11);       
        chunkRec2.AddChunk(40, 50);
        chunkRec2.AddChunk(30, 35);
        test.Log(chunkRec2.DebugOutput());
        test.Equals(chunkRec2.GetChunkCount(),3,"Test Chunk Count for middle situation")
        callback();
    });

    test.AddTest("Create Buffer", function (callback) {
        buffer = new blackvoid.tools.AutoLoadingBuffer(5, 10, loadModes.Forward, dataMethod);
        callback();
    });

    test.AddTest("Try Getting Some Data Outside the range", function (callback) {
        try
        {
            buffer.GetData(1, 3, function (data) {
                
            });
            test.Assert(false, "Getting Invalid Data should raise an exception");
        } catch (e) {
            test.Assert(true, "Exception Should Occur");
        }
        callback();
    });

    test.AddTest("Try Getting Some ActualData", function (callback) {
        buffer.GetData(5, 6, function (data) {
            test.Assert(data.length === 2, "Length should be equal to 2");
            test.Assert(data[0].index !== undefined, "returned data item 0 should have an index property");
            test.Assert(data[0].index === 5, "returned data item 0 should have an index of 5");
            test.Assert(data[0].item !== undefined, "returned data item 0 should have an item property");
            test.Assert(data[0].item === "House", "returned data item 0 should have an item of 'House'");
            test.Assert(data[1].index !== undefined, "returned data item 0 should have an index property");
            test.Assert(data[1].index === 6, "returned data item 0 should have an index of 5");
            test.Assert(data[1].item !== undefined, "returned data item 0 should have an item property");
            test.Assert(data[1].item === "Cat", "returned data item 0 should have an item of 'House'");
            callback();
        });
    });

    test.AddTest("Verify that background loading has completed", function (callback) {
        //Do this as a timeout so as to ensure background loading happens first
        setTimeout(function () {
            test.Assert(buffer.IsLoaded(), "Buffer has loaded in the background");
            callback();
        }, 5000);
    });


    var settings = {
        BufferSize: 100,
        BufferCount: 3,
        ChunkSize: 10
    };

    test.AddTest("Create Cache", function (callback) {
        cacheTool = new blackvoid.tools.MultiCache(countMethod, dataMethod, settings);
        callback();
    });

    test.AddTest("Test Retrieval", function (callback) {
        

        cacheTool.GetData(0, 9, function (data) {
            test.Equals(data.length, 10, "Returned Data Array");
            test.Assert(data[0].index !== undefined, "returned data item 0 should have an index property");
            test.Equals(data[0].index,5, "returned data item 0 should have an index of 5");
            test.Assert(data[0].item !== undefined, "returned data item 0 should have an item property");
            test.Equals(data[0].item,"House", "returned data item 0 should have an item of 'House'");
            callback();
        });        
    });


    test.RunTests();

};

mainTest();