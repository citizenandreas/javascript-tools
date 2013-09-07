/*****************************************************************

    Sagittarius - A Javascript implementation of a local cache
    Copyright 2013 Andreas Paterson

    For use with very large sets of data (Record counts in the millions). 
    Maintains a cache comprising of a number of sets of background loaded
    records. As an example we might have records 0 - 9999, 10000 - 19999, 
    150000 - 159999. The data is loaded as and when requested, caches are 
    filled in in the background.

	Requires
	jQuery

******************************************************************/
/*

	


*/


if (typeof blackvoid === "undefined")
{
	var blackvoid = {};
}

if (blackvoid.tools === undefined)
{
	blackvoid.tools = {};
}

(function () {

var g_error_OutOfRange = "Data is out of Range";
var g_error_AlreadyLoaded = "This section is already loaded.";

var g_loadModes = {
    Forward: 1,
    Back: 2,
    Center: 3
};

var _t = blackvoid.tools;

_t.BufferLoadModes = g_loadModes;

_t.DataChunkRecorder = function (_from, _to) {
    var _loadedChunks = new Array();
    var _min;
    var _max;

    var _isInRange = function (from, to) {
        return (from >= _from && to <= _to);
    };

    var _isLoaded = function () {
        var l = _loadedChunks;
        if (l.length === 1 && l[0].from === _from && l[0].to === _to) {
            return true;
        } else {
            return false;
        }
    };

    var _findContainingChunk = function (postion) {
        for (var i = 0, j = _loadedChunks.length; i < j; i++) {
            var chunk = _loadedChunks[i];
            if (postion >= chunk.from && postion <= chunk.to) {
                return { index: i, chunk: chunk };
            }
        }
        
        return null;
    };

    var _setMaxAndMin = function () {
        var l = _loadedChunks.length
        if (l > 0) {
            _min = _loadedChunks[0].from;
            _max = _loadedChunks[l - 1].to;
        } else {
            _min = 0;
            _max = 0;
        }        
    }

    var _getDataNeededRange = function (from, to) {
        var result = { from: from, to : to };
        if (!_isInRange(from, to))
            throw g_error_OutOfRange;

        for (var i = 0, j = _loadedChunks.length; i < j; i++) {
            var chunk = _loadedChunks[i];
            // We already have what we're after so return nothing
            if (from >= chunk.from && to <= chunk.to) {
                return null;
            }

            // The from point falls within the chunk, so we up it to the nexr record
            // after the end of the chunk
            if (from > chunk.from && from < chunk.to) {
                result.from = chunk.to + 1;
            }

            // The to point falls within the chunk, so we down it to the first record 
            // before the beginning of the chunk
            if (to > chunk.from && to < chunk.to) {
                result.to = chunk.from - 1;
            }
        }

        return result;
    };

    var _getChunkCount = function () {
        return _loadedChunks.length;
    };

    var _getEarliestEmptyBlock = function (blockSize) {
        if (_isLoaded()) {
            throw g_error_AlreadyLoaded;
        };

        var firstChunk = (_loadedChunks.length > 0) ? _loadedChunks[0] : null;
        var secondChunk = (_loadedChunks.length > 1) ? _loadedChunks[1] : null;
        var from;
        var to;
        if (firstChunk === null) {
            from = _from;
            to = _from + blockSize;            
        } else if (firstChunk.from === _from) {
            from = firstChunk.to + 1;
            if (secondChunk !== null) {
                to = Math.min(Math.max(secondChunk.from -1, from + blockSize), _from);
            } else {
                to = Math.min(firstChunk.to + blockSize, _to);
            }
        } else {
            from = _from;
            to = Math.min(firstChunk.from, from + blockSize, _to);            
        }

        return { from: from, to: to };
    };

    var _getLatestEmptyBlock = function (blockSize) {
        if (_isLoaded()) {
            throw g_error_AlreadyLoaded;
        };

        var lastChunk = (_loadedChunks.length > 0) ? _loadedChunks[_loadedChunks.length - 1] : null;
        var penultimateChunk = (_loadedChunks.length > 1) ? _loadedChunks[_loadedChunks.length - 2] : null;
        var from;
        var to;
        if (lastChunk === null) {
            to = _to;
            from = Math.max(_from, to - blockSize);
        } else if (lastChunk.to === _to) {
            to = lastChunk.from - 1;
            if (penultimateChunk !== null) {
                from = Math.max(Math.min(penultimateChunk.to + 1, to - blockSize),_from);
            } else {
                from = Math.max(to - blockSize, _from);
            }
        } else {
            to = _to;
            from = Math.max(lastChunk.to,to - blockSize, _from);
        }

        return { from: from, to: to };
    };

    var _getCentralEmptyBlock = function (blockSize) {
        if (_isLoaded()) {
            throw g_error_AlreadyLoaded;
        };
        var from;
        var to;
        var midpoint = Math.floor((_from + _to) / 2);
        var blockReach = Math.floor(blockSize / 2);

        if (_loadedChunks.length === 0)
        {
            from = Math.max(_from, midpoint - blockReach);
            to = Math.min(_to,midpoint + blockReach);
            return { from: from, to: to };
        }
        
        var midDetails = _findContainingChunk(midpoint);     

        if (midDetails !== null) {
            var up = midDetails.chunk.to - midpoint;
            var down = midpoint - midDetails.chunk.from;
            if (up > down) {
                to = midDetails.chunk.from - 1;
                from = Math.max(_from, to - blockSize);
                var fromDetails = _findContainingChunk(from);
                from = (fromDetails !== null) ? fromDetails.chunk.to + 1 : from;
            } else {
                from =  midDetails.chunk.from - 1;  
                to = Math.max(_from, to - blockSize);
                var toDetails = _findContainingChunk(to);
                to = (toDetails !== null) ? toDetails.chunk.from - 1 : to;
            }
        } else {
            from = Math.max(_from, midpoint - blockReach);
            to = Math.min(_to, midpoint + blockReach);
            var fromDetails = _findContainingChunk(from);
            var toDetails = _findContainingChunk(to);
            from = (fromDetails !== null) ? fromDetails.chunk.to + 1 : from;
            to = (toDetails !== null) ? toDetails.chunk.from - 1 : to;
        }

        return { from: from, to: to };
    };

    var _getMax = function () {
        return _max;
    };

    var _getMin = function () {
        return _min;
    };

    var _addChunk = function (from, to) {
        var newChunks = new Array();        
        if (!_isInRange(from, to))
            throw g_error_OutOfRange;

        if (_loadedChunks.length === 0) {
            _loadedChunks.push({ from: from, to: to });
            _setMaxAndMin();
            return;
        }

        var newChunkAdded = false;
        if (to < (_loadedChunks[0].from - 1))
        {
            newChunkAdded = true;
            newChunks.push({ from: from, to: to });
        }

        for (var i = 0, j = _loadedChunks.length; i < j; i++) {
            var useChunk = true;
            var chunk = _loadedChunks[i];                       

            if (from >= chunk.from && to <= chunk.to) {
                // If the new chunk falls within the current chunk
                newChunkAdded = true;
            } else if (to >= chunk.from - 1 && to <= chunk.to && from < chunk.from) {
                // If the new chunk starts before the current chunk and ends
                // next to or inside it we extend this exiting chunk rather than
                // inserting a new one
                newChunkAdded = true;
                chunk.from = from;
            } else if (from >= chunk.from && from <= chunk.to + 1 && to > chunk.to) {
                // If the chunk starts inside or next to the exising chunk we extend
                // this chunk.
                newChunkAdded = true;
                chunk.to = to;

                // Now we need to handle the case where the end of the new chunk runs into
                // the beginning of the old chunk (or even swallows it whole and runs into 
                // the chunk after that)
                var nextChunk = (i + 1 < j) ? _loadedChunks[i + 1] : null;
                var keepLooking = true;
                while (nextChunk !== null && keepLooking) {

                    if (to >= (nextChunk.from - 1) && to <= nextChunk.to) {
                        chunk.to = nextChunk.to;
                        keepLooking = false;
                        i += 1;
                    } else if (to > nextChunk.to) {
                        nextChunk = (i + 1 < j) ? _loadedChunks[i + 1] : null;
                        i += 1;
                    } else if (to < nextChunk.from) {
                        keepLooking = false;
                    }
                }
            }
                        
            newChunks.push(chunk);        
        }
        
        if (!newChunkAdded) {
            newChunks.push({ from: from, to: to });
        }


        _loadedChunks = newChunks.sort(function (a, b) { return a.to - b.to });
        _setMaxAndMin();
    };

    var _debugOutput = function () {
        var output = "";
        var prefix = "";
        for (var i = 0, j = _loadedChunks.length; i < j; i++) {
            var chunk = _loadedChunks[i];
            output += prefix + chunk.from + "-" + chunk.to;
            prefix = ",";
        }
        return output;
    };

    this.AddChunk = _addChunk;
    this.IsLoaded = _isLoaded;
    this.GetChunkCount = _getChunkCount;
    this.GetDataNeededRange = _getDataNeededRange;
    this.GetMax = _getMax;
    this.GetMin = _getMin;
    this.GetEarliestEmptyBlock = _getEarliestEmptyBlock;
    this.GetLatestEmptyBlock = _getLatestEmptyBlock
    this.GetCentralEmptyBlock = _getCentralEmptyBlock;
    this.DebugOutput = _debugOutput;
};

_t.AutoLoadingBuffer = function (_from, _to, _loadMode, _getMethod, _settings) {
    var _defaults = {
        ChunkSize: 50
    };

    var _config = $.extend({}, _defaults, _settings);

    _from = parseInt(_from, 10);
    _to = parseInt(_to, 10);
    var _size = (_to - _from) + 1;    
    var _data = new Array(_size);
    var _lastAccess = new Date();
    var _chunkRecorder = new _t.DataChunkRecorder(_from,_to);
    var _isInRange = function (from, to) {
        return (from >= _from && to <= _to);
    };

    var _autoLoad = function () {
        console.log("AutoLoad");
        var block;
        if (!_chunkRecorder.IsLoaded()) {
            if (_loadMode === g_loadModes.Back) {
                block = _chunkRecorder.GetLatestEmptyBlock(_config.ChunkSize);
            } else if (_loadMode === g_loadModes.Center) {
                block = _chunkRecorder.GetCentralEmptyBlock(_config.ChunkSize);
            } else {
                block = _chunkRecorder.GetEarliestEmptyBlock(_config.ChunkSize);
            }

            _getMethod(block.from, block.to, function (data) {
                var first = block.from - _from;
                var last = block.to - _from;
                // Fill the _data array with blanks for the data we don't have yet
                while (_data.length < (last - 1)) {
                    _data.push(null);
                }

                for (var i = first, j = 0; i <= last; i++, j++) {
                    _data[i] = data[j];
                }

                _chunkRecorder.AddChunk(block.from, block.to);
                _autoLoad();
            });
        }
    };

    var _getData = function (from, to, callback) {
        _lastAccess = new Date();
        from = parseInt(from, 10);
        to = parseInt(to, 10);
        if (isNaN(from) || isNaN(to))
            throw "Input is not integer numeric";

        if (!_isInRange(from, to))
            throw g_error_OutOfRange;

        var neededRange = _chunkRecorder.GetDataNeededRange(from,to);
        
        if (neededRange !== null) {
            _getMethod(neededRange.from, neededRange.to, function (data) {
                var first = neededRange.from - _from;
                var last = neededRange.to - _from;
                // Fill the _data array with blanks for the data we don't have yet
                while (_data.length < (last - 1)) {
                    _data.push(null);
                }

                for (var i = first, j = 0; i <= last; i++, j++) {
                    _data[i] = data[j];
                }

                _chunkRecorder.AddChunk(from, to);
                // When all is said an done we recusively call the same method, this time
                // the data should be loaded so we 
                // Comment this out for now
                _getData(from, to, callback);
            });
        } else {
            var data = new Array();
            var first = from - _from;
            var last = to - _from;
            for (var i = first, j = 0; i <= last; i++, j++) {
                data[j] = _data[i];
            }
            callback(data);

            if (!_chunkRecorder.IsLoaded()) {
                _autoLoad();
            }

        }
    };

    this.IsLoaded = _chunkRecorder.IsLoaded;
    this.GetData = _getData;
    this.GetLastAccess = function () { return _lastAccess; };
};

_t.MultiCache = function(_getMethod,_settings) {
	var _defaults = {
		BufferSize: 10000,
		BufferCount: 10,
		ChunkSize: 50		
	};

	var _config = $.extend({}, _defaults, _settings);
	var _itemcount = 0;
	var _buffers = new Array();  

	/* Public Methods */
	this.GetData = function(from,to,callback)
	{
	    var data = new Array();
	    for (var i = 0, j = _buffers.length; i < j; i++) {
	        var buffer = _buffers[i];
	    }
	    callback();
	};
};



})();