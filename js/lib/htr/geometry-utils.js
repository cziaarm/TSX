(function(module, global){

  module.exports = {
  
    getRect: function($node, delta) {
      var delta = delta || 0;
      var rect    = $node.offset();
      rect.left -= delta;
      rect.top  -= delta;
      rect.width  = $node.outerWidth()  + 2*delta;
      rect.height = $node.outerHeight() + 2*delta;
      rect.right  = rect.left + rect.width;
      rect.bottom = rect.top  + rect.height;
      return rect;
    },
  
    boundingBox: function(points) {
      var minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
      for (var i = 0; i < points.length; i++) {
        minX = Math.min(minX, points[i][0]);
        minY = Math.min(minY, points[i][1]);
        maxX = Math.max(maxX, points[i][0]);
        maxY = Math.max(maxY, points[i][1]);
      }
      return { left: minX, top: minY, width: maxX - minX, height: maxY - minY, right: maxX, bottom: maxY };
    },
  
  
    rectDistance: function(rect, point) {
      var x = point[0], y = point[1], r = { 
        x1: rect.left,
        x2: rect.left + rect.width,
        y1: rect.top,
        y2: rect.top + rect.height,
      };
  
      var dist = { d: 0, dx: 0, dy: 0 };
      if ((r.x1 <= x && x <= r.x2) && (r.y1 <= y && y <= r.y2)) return dist;
  
      if (x < r.x1) dist.dx = x - r.x1;
      else if (x > r.x2) dist.dx = x - r.x2;
      else dist.dx = 0;
  
      if (y < r.y1) dist.dy = y - r.y1;
      else if (y > r.y2) dist.dy = y - r.y2;
      else dist.dy = 0;
      
      dist.d = Math.sqrt(Math.pow(dist.dx, 2) + Math.pow(dist.dy, 2));
      return dist;
    },
  
    nodeCollision: function(node, points, delta) {
      var rect = getRect($(node), delta);
      var bb = this.boundingBox(points);
      if (rect.left > bb.right || rect.right < bb.left || rect.top > bb.bottom || rect.bottom < bb.top) return 0;
      else {
        var l = points.length;
        var distance = {d: l, dx: l, dy: l};
        for (var i = 0; i < l; ++i) {
          var x = points[i][0], y = points[i][1];
          var isInX = (x >= rect.left && x <= rect.right);
          var isInY = (y >= rect.top  && y <= rect.bottom)
          if (isInX && isInY) distance.d--;
          if (isInX) distance.dx--;
          if (isInY) distance.dy--;
        }
        return distance;
      } 
    },
  
    nodeDistance: function(node, point, delta) {
      var rect = this.getRect($(node), delta);
      return this.rectDistance(rect, point);
    },
  
    nodeCenter: function(node) {
      //var r = node.getClientRects()[0];
      var r = this.getRect($(node));
      return { x: r.x + r.width/2, y: r.y + r.height/2 } 
    },

    getNextHighestDepth: function(e) {
      var highestIndex = 0, currentIndex = 0, elementArray = [];
      // check all elements in page ...
      if (document.getElementsByTagName) {
        elementArray = document.getElementsByTagName('*');
      } else if (e.getElementsByTagName) {
        elementArray = document.getElementsByTagName('*');
      }
      // ... and iterate
      for (var i = 0, l = elementArray.length; i < l; ++i) {
        if (elementArray[i].currentStyle) {
          currentIndex = parseFloat(elementArray[i].currentStyle.zIndex);
        } else if (window.getComputedStyle) {
          currentIndex = parseFloat(document.defaultView.getComputedStyle(elementArray[i],null).getPropertyValue('z-index'));
        }
        if (currentIndex > highestIndex) { highestIndex = currentIndex; }
      }
      return highestIndex + 1;
    },
  
  };

})('object' === typeof module ? module : {}, this);
