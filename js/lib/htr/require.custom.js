// ==Closure.compiler==
// @compilation_level SIMPLE_OPTIMIZATIONS
// ==/Closure.compiler==

// Require() 0.3.4 unstable
//
// Copyright 2012 Torben Schulz <http://pixelsvsbytes.com/>
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.
// 
///////////////////////////////////////////////////////////////////////

(function() {
// NOTE If we would use strict mode for this closure we won't allow the modules
//      to be executed in normal mode.

  function getErrorObject(){
    try { throw Error('') } catch(err) { return err; }
  };

  function getCallerFilepath() {
    var err = getErrorObject();
    // Normalize number of stack lines in FF, Opera, & Chrome
    var normStack = err.stack.split("at Error (<anonymous>)").join("\n");
    var caller = normStack.split("\n")[3];
    var index = caller.indexOf("http:");
    var clean = caller.slice(index, caller.length);
    var parts = clean.split("/");
    delete parts[parts.length - 1];
    return parts.join("/");
  };
    
  var base = getCallerFilepath();

  if (window.require !== undefined)
    throw 'RequireException: \'require\' already defined in global scope';


  window.require = function(module, callback, refusePadding) {
    
    var url = window.require.resolve(module);

    if (require.cache[url]) {
      // NOTE The callback should always be called asynchronously
      if (callback) setTimeout(function(){callback(require.cache[url])}, 0);
      return require.cache[url];
    }
    
    var exports;
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (this.readyState != 4)
        return;
      if (this.status != 200)
        throw 'Require() exception: GET '+url+' '+this.status+' ('+this.statusText+')';


      if (window.require.cache[url]) {
        exports = window.require.cache[url];
      }
      else if (this.getResponseHeader('content-type').indexOf('application/json') != -1) { 
        exports = JSON.parse(this.responseText);
      }
      else {
        var str;
        if (!refusePadding) {
          var source = this.responseText.match(/^\s*(?:(['"]use strict['"])(?:;\r?\n?|\r?\n))?\s*((?:.*\r?\n?)*)/);
          str = '/* Require (with padding) */(function(){'+source[1]+';var undefined,exports,module={exports:exports};\n\n'+source[2]+'\n\nreturn module.exports;})();';
        }
        else {
          str = "/* Require (without padding) */var exports;" + this.responseText + "\n\ntrue;";
        }
        // acknowledge firebug and chrome what is the name of the file
        str += "\n\n//@ sourceURL=" + url;

        try {
          var errmsg = 'Module ' + module + ' with url "' + url + '" could not be included.';
          // store the line number where the eval is used to compute the real error line
          var line = (new Error).lineNumber + 1; 
          exports = eval.apply(window, [str]); 
        }
        catch (e) {
          line = e.lineNumber - line - 1;
          console.warn(errmsg);
          //if (e instanceof SyntaxError) {
          //  throw new SyntaxError(e.message, url, line);
          //}
          //else {
            console.error('In line', line, e);
          //}
        }
      }

      window.require.cache[url] = exports;
      if (callback) callback(window.require.cache[url]);
    };
    request.open('GET', url, !!callback);
    request.send();
    return exports;
  };

  window.include = function(module, callback) { window.require(module, callback, true); };

  window.require.resolve = function(module) {
    //var r = module.match(/^(\.{0,2}\/)?([^\.]*)(\..*)?$/);
    //return (r[1]?r[1]:'/js_modules/')+r[2]+(r[3]?r[3]:(r[2].match(/\/$/)?'index.js':'.js'));  
    var file = module + ".js";
    if (!module.match(/^\.{0,2}\//)) {
      file = base + file;
    }
    return file;
  };

  // INFO initializing module cache
  window.require.cache = {};
  
})();
