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

var g_loadModes = {
    Forward: 1,
    Back: 2,
    Center: 3
};

blackvoid.tools.BufferLoadModes = g_loadModes;

blackvoid.tools.AutoLoadingBuffer = function (_from, _to, _loadmode, _getmethod, _settings) {
    var _defaults = {
        ChunkSize: 50
    };

    var _config = $.extend({}, _defaults, _settings);

    _from = parseInt(_from, 10);
    _to = parseInt(_to, 10);
    var _size = (_to - _from) + 1;
    var _loadedChunks = new Array();
    var _data = new Array(_size);
    var _lastAccess = new Date();

    var _autoLoad = function (from, to) {
    };

    var _loadData = function (from, to, callback) {
        _lastAccess = new Date();
        _getmethod(from,to,callback);
    };

    this.GetData = _loadData;
    this.GetLastAccess = function () {
        return _lastAccess;
    };
};


blackvoid.tools.MultiCache = function(_countmethod,_getmethod,_settings) {
	var _defaults = {
		BufferSize: 10000,
		BufferCount: 10,
		ChunkSize: 50		
	};

	var _config = $.extend({}, _defaults, _settings);
	var _itemcount = 0;
	var _ready = false;
	var _buffers = new Array();

    /* Start it up */
	_countmethod(function (count) {
	    _itemcount = count;
	});
    

	/* Public Methods */
	this.GetData = function(from,to,callback)
	{
	    callback();
	};
};



})();