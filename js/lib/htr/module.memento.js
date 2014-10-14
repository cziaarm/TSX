// Dependencies: jquery.hotkeys
require("jquery.hotkeys");

(function(module, global){

  function Memento(elem, options) {
    var self = this, $elem;
    
    // Private -----------------------------------------------------------------
    var stack = [], pos = -1;
    
    function saveState(obj) {
      stack.push(obj);
      pos++;
    };
    
    function resetState() {
      stack = [];
      pos   = -1;
    };
        
    function onRedo(e) {
      if (!stack.length) return;
      pos++;
      if (pos >= stack.length) {
        pos = stack.length - 1;
        return;
      }
      self.change(stack[pos]);
      self.$elem.trigger('mementoredo', [pos, stack]);
    };
    
    function onUndo(e) {
      if (!stack.length) return;
      pos--;
      if (pos < 0) {
        pos = 0;
        return;
      }            
      self.change(stack[pos]);
      self.$elem.trigger('mementoundo', [pos, stack]);
    };

    var self = this;
    
    // Public API --------------------------------------------------------------
    self.id = "Memento";
    self.version = "0.2";
    
    self.addElement = function(elem) {
      if (!self.equal(elem, stack[pos])) {
        stack.length = pos + 1;
        saveState(elem);
      }
    };

    self.invalidate = function(keepCurrentState) {
      var last = stack[pos];
      resetState();
      if (keepCurrentState) {
        saveState(last);
      }
      self.$elem.trigger('mementoinvalidate');
    };

    self.getState = function() {
      return stack[pos];
    };
    
    // Mandatory intialization method ------------------------------------------
    self.init = function(elem, options) {
      self.$elem = $(elem);
      self.$elem.bind('keydown', 'ctrl+z', function(e){
        onUndo(e);
      }).bind('keydown', 'ctrl+y', function(e){
        onRedo(e);
      }).bind('keydown', 'ctrl+shift+z', function(e){
        onRedo(e);
      });
      // Attach other listeners, if any
      for (var opt in options) {
        if (options.hasOwnProperty(opt) && typeof options[opt] !== 'undefined') {
          self[opt] = options[opt];
        }
      }
      console.log("Loaded", self);
      // First run, if any
      self.start();
    };
    
    // Listeners ---------------------------------------------------------------
    self.start = function() {
    };
    
    self.change = function(data) {
      return data;
    };
        
    self.equal = function(data1, data2) {
      return data1 === data2;
    };
  };
  
  // Expose module
  module.exports = Memento;
  
})('object' === typeof module ? module : {}, this);
