/*
	
	JSDataCache, a data caching tool for use with very large sets of 
	data (Record counts in the millions). Maintains a number of caches of 
	sections of the data as and when needed. As an example we might have 
	records 0 - 9999, 10000 - 19999, 150000 - 159999. The data is loaded 
	as and when requested, caches are filled in in the background.

	Requires
	jQuery

*/


if (typeof blackvoid === undefined)
{
	var blackvoid = {};
}

if (typeof blackvoid.tools === undefined)
{
	blackvoid.tools = {};
}

(function () {

blackvoid.tools.JSDataCache = function(countmethod,getmethod,settings) {
	var defaults = {
		BufferSize: 10000,
		BufferCount: 10,
		ChunkSize: 50		
	};

	var buffers = new Array();

	var newBuffer = function() {
		
	}



	/* Public Methods */
	this.GetData = function(from,to,callback)
	{

	};
};



})();