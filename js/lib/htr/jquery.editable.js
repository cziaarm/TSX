(function($) {

  var NLP = require('nlp-utils');
  var G   = require('geometry-utils');
  $('html').attr('spellcheck', 'false');

  var methods = {
    init: function(_options) {
      // extend default options with user defined options
      var options = $.extend({
        disabled: false, // if true, disable content editable. The user cannot change the content
      }, _options);

      return this.each(function() {
        var $this = $(this), data = $this.data('editable');
        
        $this.attr('contenteditable', !options.disabled);
        $this.css('white-space', 'pre-wrap');
        
        // If the plugin hasn't been initialized yet
        if (!data) {
          $(this).data('editable', {ntok: 0, options: options});
        }

        $this.bind('blur.editable click.editable mouseleave.editable keyup.editable', this, function(ev) {
          $(ev.data).editable('updateCaret');
        });

      });
    },

    destroy: function() {
      return this.each(function() {

        var $this = $(this),
            data = $this.data('editable');

        // Namespacing FTW
        $this.unbind('.editable');
        $this.removeData('editable');
        $this.text($this.text());
      })
    },

    getTokenAtCaret: function() {
      var pos = $(this).editable('getCaretPos');
      return $(this).editable('getTokenAtCaretPos', pos);
    },

    getTokenAtCaretPos: function(pos) {
      var $this = $(this),
          node = $this.get(0),
          elem;

      var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false)

      // find HTML text element in cursor position
      while (walker.nextNode()) {
        elem = walker.currentNode;
        if ((pos - elem.length) >= 0) pos -= elem.length;
        else break;
      }

      return {elem: elem, pos: pos};
    },

    getTokensAtStroke: function(points, delta) {
      if (!delta) delta = 0; 
      var $this = $(this);
      var spans = $.makeArray($('span', $this));

      var tokens = []
      for (var i = 0; i < spans.length; ++i) {
        var distance = G.nodeCollision(spans[i], point, delta);
        tokens.push({ token: spans[i], distance: distance });
      }
      tokens.sort(function(a,b){ return a.distance.d - b.distance.d});
      return tokens;
    },

    getTokensAtXY: function(point, delta) {
      if (!delta) delta = 0; 
      var $this = $(this);
      var spans = $.makeArray($('span', $this));

      var tokens = []
      for (var i = 0; i < spans.length; i++) {
        var distance = G.nodeDistance(spans[i], point, delta);
        tokens.push({ token: spans[i], distance: distance });
      }
      tokens.sort(function(a,b){ return a.distance.d - b.distance.d});
      return tokens;
    },

    getTokensAtRect: function(rect, delta) {
      if (!delta) delta = 0; 
      var $this = $(this);
      var spans = $.makeArray($('span', $this));

      var r = { 
        x1: rect.x - delta,
        x2: rect.x + rect.width + delta,
        y1: rect.y - delta,
        y2: rect.y + rect.height + delta
      };

      var tokens = [];
      for (var i = 0; i < spans.length; i++) {
        var center = G.nodeCenter(spans[i]);
        var distance = G.rectDistance(rect, center.x, center.y);
        tokens.push({ token: spans[i], distance: distance });
      }
      tokens.sort(function(a,b){ return a.distance.d - b.distance.d});
      return tokens;
    },

    forgetCaret: function() {
      var data = $(this).data('editable');
      var oldSpan = data.currentElement;
      data.currentElement = undefined;
      data.lastPos = undefined;
      if (oldSpan && oldSpan.parentNode && $(oldSpan).parent().is('.editable-token')) {
        var ev = { token: oldSpan }
        $(oldSpan).parent().trigger('caretleave', ev);
      }
    },


    guessToken: function(elem, pos) {
      if (!elem) {
        return {isToken: false, node: elem, pos: pos};
      }
      if (elem.parentNode && $(elem.parentNode).is('.editable-token')) {
        return {isToken: true, node: elem, pos: pos};
      }
      else {
        var adj = elem, newPos = pos;;
        if (pos === 0) {
          do {
            adj = adj.previousSibling;
          } while (adj && adj.nodeType === 3 && adj.length === 0); 
          if (adj) {
            if (adj.firstChild) adj = adj.firstChild;
            newPos = adj.length;
          }
        }
        else if (pos === elem.length) {
          do {
            adj = adj.nextSibling;
          } while (adj && adj.nodeType === 3 && adj.length === 0); 
          if (adj) adj = adj.firstChild;
          newPos = 0;
        }
        if (adj && adj.parentNode && $(adj.parentNode).is('.editable-token')) {
          return {isToken: true, node: adj, pos: newPos};
        }
      }
      return {isToken: false, node: elem, pos: pos};
    },


    refreshCaret: function() {
      var absoluteCaretPos = $(this).editable('getCaretPos');
      var token = $(this).editable('getTokenAtCaretPos', absoluteCaretPos);
      var tok = $(this).editable('guessToken', token.elem, token.pos);

      $(this).editable('storeCaret', tok, absoluteCaretPos);
    },

    storeCaret: function(tok, absoluteCaretPos) {
      var data = $(this).data('editable');
      var ev = {
        token: tok.node,
        caretPos: tok.pos,
        absoluteCaretPos: absoluteCaretPos
      };
      data.currentElement = tok.node;
      if (tok.isToken) $(tok.node.parentNode).trigger('caretenter', ev);
    },


    updateCaret: function(pos) {
      var $this = $(this),
          data = $this.data('editable');

      if (!$this.is(":focus")) {
        $this.editable('forgetCaret');
        return undefined;
      }

      if (typeof pos === 'undefined') pos = $this.editable('getCaretPos');
      var absoluteCaretPos = pos;

      var token = $this.editable('getTokenAtCaretPos', pos);
      var elem = token.elem;
      pos = token.pos;

      if (!elem) {
        $this.editable('forgetCaret');
        return undefined;
      }

      // emmit caretenter and caretleave events
      var tok = $(this).editable('guessToken', elem, pos);
      if (data.currentElement !== tok.node) {
        $this.editable('forgetCaret');
        $this.editable('storeCaret', tok, absoluteCaretPos);
      }

       // place the cursor in the current element
      token.range = document.createRange();
      token.range.setStart(token.elem, token.pos);
      token.range.collapse(true);
     
      var ev = { target: this, pos: pos, lastPos: data.lastPos, token: token, caretRect: token.range.getClientRects()[0] }
      data.lastPos = (elem)?pos:undefined;
      $this.trigger('caretmove', ev);

      return token;
    },

    getCaretPos: function() { 
      var $this = $(this),
          data = $this.data('editable'),
          node = $this.get(0);

      var caretOffset = 0;
      try {
        if (typeof window.getSelection != "undefined") {
          var range = window.getSelection().getRangeAt(0);
          var preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(node);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          caretOffset = preCaretRange.toString().length;
        } else if (typeof document.selection != "undefined" && document.selection.type != "Control") {
          var textRange = document.selection.createRange();
          var preCaretTextRange = document.body.createTextRange();
          preCaretTextRange.moveToElementText(node);
          preCaretTextRange.setEndPoint("EndToEnd", textRange);
          caretOffset = preCaretTextRange.text.length;
        }
      }
      catch (err) {}
      return caretOffset;
    },

    getCaretXY: function() { 
      var $this = $(this);

      var absolutePos = $this.editable('getCaretPos');
      var token = $this.editable('getTokenAtCaretPos', absolutePos);
      var caretRect;

      token.range = document.createRange();
      try {
        token.range.setStart(token.elem, token.pos);
        token.range.collapse(true);
        caretRect = jQuery.extend({}, token.range.getClientRects()[0]);
      }
      catch (err) {
//        console.warn(err, printStackTrace());
        caretRect = jQuery.extend({}, this.get(0).getClientRects()[0]);
        // Recompute caretRect to eliminate margins, borders and paddings
        caretRect.top += parseFloat($this.css('border-top-width')) + parseFloat($this.css('padding-top')); // parseFloat($this.css('margin-top')) + 
        caretRect.bottom = caretRect.top + $this.height() - 1
        caretRect.left += parseFloat($this.css('border-left-width')) + parseFloat($this.css('padding-left')); // parseFloat($this.css('margin-left')) + 
        caretRect.right = caretRect.left + $this.width() - 1
        absolutePos = 0;
        token = undefined;
      }
 
      return { pos: absolutePos, token: token, caretRect: caretRect }
    },

    getTokenPos: function(token) { 
      var $this = $(this)
        , textTok = $(token).contents().filter(function() { return this.nodeType == 3; }).get(0)
        , pos = 0;

      var walker = document.createTreeWalker($this.get(0), NodeFilter.SHOW_TEXT, null, false)

      // find HTML text element in cursor position
      while (walker.nextNode()) {
        elem = walker.currentNode;
        if (elem === textTok) break; 
        pos += elem.length;
      }

      return pos;
    },

    setCaretAtToken: function(token) {
      var pos = this.editable('getTokenPos', token);
      this.editable('setCaretPos', pos);
    },

    setCaretPos: function(pos) {
      var token = this.editable('updateCaret', pos);

      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(token.range);
    },

    getText: function() {
      return $(this).text();
    },

    setText: function(str, segs) {
      var $this = $(this),
          data = $this.data('editable');

      //XXX: can we assume this?
      //if (data['str'] === str) return;
      data['str'] = str;

      if (segs && segs.length > 0) {

        var spans = $.makeArray($('span', $this));
        var old_tokens = new Array();
        for (var i = 0; i < spans.length; i++) {
          spans[i] = $(spans[i]);
          old_tokens.push(spans[i].text());
        }

        // get old tokens from data and new tokens
        var new_tokens = NLP.tokenizeBySegments(str, segs);
        // diff both tokens to keep unchanged spans
        var merge = NLP.mergeTokens(old_tokens, new_tokens);

        //console.log("old tokens:", old_tokens);
        //console.log("new tokens:", new_tokens);
        //console.log("****MERGE*****", merge);

        var tokens = $this.clone(); 
        var id = $this.attr('id');

        tokens.empty();
        // add initial spaces
        if (segs[0][0] > 0) {
          var spaces = str.slice(0, segs[0][0]);
          tokens.append(document.createTextNode(spaces));
        }

        // add rest of tokens
        for (var mi = 0; mi < merge.length; mi++) {
          var merge_pos = merge[mi][0], 
              tok_id = merge[mi][1],
              merge_type = merge[mi][2];

          if (tok_id < 0) continue;
          var pos = segs[tok_id];

          // get next token
          var span, txt = str.slice(pos[0], pos[1]);
          // if the action is none or substitution then leave the node as is 
          if (merge_pos >= 0) {
            span = spans[merge_pos].clone(true); 
          }
          // else create a new node 
          else { 
            span = $('<span/>', {class: 'editable-token'});
          }

          // if the text changed (not action none) 
          if (merge_type != 'N') { 
            // set the new token id and change the text
            span.attr('id', id + '_' + (data.ntok++)); 
          }

          span.text(txt);
          span.data('tok', tok_id); 
          span.data('merge-type', merge_type); 
          tokens.append(span);

          // add space token
          var spaces = '';
          if (tok_id < segs.length - 1) {
            spaces = str.slice(pos[1], segs[tok_id + 1][0]);
          }
          else {
            spaces = str.slice(pos[1]);
          }
          //if (spaces.length > 0) {
            tokens.append(document.createTextNode(spaces));
          //}
        }

        if ($this.is(':focus')) {
          var pos = $this.editable('getCaretPos');
          $this.empty();
          $this.append(tokens.contents()); 
          $this.editable('setCaretPos', pos);
        }
        else {
          $this.empty();
          $this.append(tokens.contents()); 
        }
      }
      else { // not tokenization
        $this.text(str); 
      }
    },

    appendWordAfter: function(str, $node, spaces) {
      var $this = $(this),
          data = $this.data('editable');

      // create space node
      var $spaces;
      if (spaces) {
        $spaces = $(document.createTextNode(spaces));
      }

      // create a new node 
      var $span = $('<span/>', {
        class: 'editable-token', 
        text: str, 
        id: $this.attr('id') + '_' + (data.ntok++)
      });

      // get token id
      var tok_id = 0;
      if ($node) {
        tok_id = $node.data('tok') + 1;
      }

      $span.data('tok', tok_id); 


      // save caret pos
      var pos;
      if ($this.is(':focus')) {
        pos = $this.editable('getCaretPos');
      }

      // insert at the beginning
      if (!$node) {
        if ($spaces) $this.prepend($spaces);
        $this.prepend($span);
      }
      // insert after node 
      else if ($node) {
        $span.insertAfter($node);
        if ($spaces) $spaces.insertAfter($node);
      }

      // restore caret pos
      if ($this.is(':focus')) {
        $this.editable('setCaretPos', pos);
      }

      return { $token: $span, $spaces: $spaces };
    },

    replaceText: function(str, segs, elemsToReplace, is_final) {
      var $this = $(this),
          data = $this.data('editable');

      if (str === "" || segs.length == 0) return;

      var replaceable = elemsToReplace; 
      if (elemsToReplace instanceof Array) {
        if (elemsToReplace.length > 0) {
          replaceable = elemsToReplace[0];
          for (var i = 1; i < elemsToReplace.length; i++) {
            elemsToReplace[i].remove();
          }          
        }
        else {
          replaceable = undefined;
        }
      }

      if (!replaceable) return;
      replaceable = $(replaceable);

      if (is_final) {
        var tokens = $('<span/>'); 
        if (segs && segs.length > 0) {
  
          // get old tokens from data and new tokens
          var str_tokens = NLP.tokenizeBySegments(str, segs);
  
          var id = $this.attr('id');
  
          // add initial spaces
          if (segs[0][0] > 0) {
            var spaces = str.slice(0, segs[0][0]);
            tokens.append(document.createTextNode(spaces));
          }
  
          // add rest of tokens
          for (var tok_id = 0; tok_id < str_tokens.length; tok_id++) {
  
            var pos = segs[tok_id];
  
            // create a new node 
            var span = $('<span/>', {
                class: 'editable-token', 
                text: str_tokens[tok_id], 
                id: id + '_' + (data.ntok++)
            });
  
            span.data('tok', tok_id); 
            tokens.append(span);
  
            // add space token
            var spaces = '';
            if (tok_id < segs.length - 1) {
              spaces = str.slice(pos[1], segs[tok_id + 1][0]);
            }
            else {
              spaces = str.slice(pos[1]);
            }
            //if (spaces.length > 0) {
              tokens.append(document.createTextNode(spaces));
            //}
          }
  
        }
        else { // not tokenization
          tokens.append(document.createTextNode(str));
        }
  
        if ($this.is(':focus')) {
          var pos = $this.editable('getCaretPos');
          replaceable.replaceWith(tokens.contents());
          $this.editable('setCaretPos', pos);
        }
        else {
          replaceable.replaceWith(tokens.contents());
        }
      }
      else {
        replaceable.text(str);
      }

      data['str'] = $this.text();

    },

  };



  $.fn.editable = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || ! method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist on jQuery.editable');
    }    
  };

})(jQuery);
