// github.com/paulirish/jquery-ajax-localstorage-cache
// dependent on Modernizr's localStorage test

$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {

  // Cache it ?
  if ( !Modernizr.localstorage || !options.localCache ) return;

  var hourstl = options.cacheTTL || 5;

  var cacheKey = options.cacheKey || 
                 options.url.replace( /jQuery.*/,'' ) + options.type + options.data;
  
  // isCacheValid is a function to validate cache
  if ( options.isCacheValid &&  ! options.isCacheValid() ){
    localStorage.removeItem( cacheKey );
  }
  // if there's a TTL that's expired, flush this item
  var ttl = localStorage.getItem(cacheKey + 'cachettl');
  if ( ttl && ttl < +new Date() ){
    localStorage.removeItem( cacheKey );
    localStorage.removeItem( cacheKey  + 'cachettl' );
    ttl = 'expired';
  }
  
  var value = localStorage.getItem( cacheKey );
  if ( value ){
    //In the cache? So get it, apply success callback & abort the XHR request
    // parse back to JSON if we can.
    if ( options.dataType.indexOf( 'json' ) === 0 ) value = JSON.parse( value );
    options.success( value );
    // Abort is broken on JQ 1.5 :(
    jqXHR.abort();
  } else {

    //If it not in the cache, we change the success callback, just put data on localstorage and after that apply the initial callback
    if ( options.success ) {
      options.realsuccess = options.success;
    }  
    options.success = function( data ) {
      var strdata = data;
      if ( this.dataType.indexOf( 'json' ) === 0 ) strdata = JSON.stringify( data );
      localStorage.setItem( cacheKey, strdata );
      if ( options.realsuccess ) options.realsuccess( data );
    };

    // store timestamp
    if ( ! ttl || ttl === 'expired' ) {
      localStorage.setItem( cacheKey  + 'cachettl', +new Date() + 1000 * 60 * 60 * hourstl );
    }
    
  }
});