(function(module, global){
  module.exports = {
  
    getTokens: function(elems) {
      var tokens = new Array();
      for (var i = 0; i < elems.length; i++) {
        tokens.push($(elems[i]).text());
      }
      return tokens;
    },
  
    tokenizeBySegments: function(str, segs) {
      var tokens = [];
      for (var tok_id = 0; tok_id < segs.length; tok_id++) {
        var pos = segs[tok_id];
        var tok = str.slice(pos[0], pos[1]);
        tokens.push(tok);
      }
      return tokens;
    },
  
    editDistance: function(s1, s2) {
      if (s1 == s2) return 0;
  
      var s1_len = s1.length, 
          s2_len = s2.length;
      if (s1_len === 0) return s2_len;
      if (s2_len === 0) return s1_len;
  
      var v0 = new Array(s1_len+1);
      var v1 = new Array(s1_len+1);
  
      var cost=0;
      for (var s1_idx = 0; s1_idx < s1_len + 1; s1_idx++) {
          v0[s1_idx] = s1_idx;
      }
      for (var s2_idx = 1; s2_idx <= s2_len; s2_idx++) {
          v1[0] = s2_idx;
          var char_s2 = s2[s2_idx - 1];
  
          for (var s1_idx = 0; s1_idx < s1_len; s1_idx++) {
              var char_s1 = s1[s1_idx];
              cost = (char_s1 == char_s2) ? 0 : 1;
              var m_min = v0[s1_idx+1] + 1;
              var b = v1[s1_idx] + 1;
              var c = v0[s1_idx] + cost;
              if (b < m_min) m_min = b; 
              if (c < m_min) m_min = c; 
              v1[s1_idx+1] = m_min;
          }
          var v_tmp = v0;
          v0 = v1;
          v1 = v_tmp;
      }
      return v0[s1_len]/Math.max(s1_len, s2_len);
    },
  
    mergeTokens: function(spans, tokens) {
      var l1 = (spans)?spans.length:0, l2 = (tokens)?tokens.length:0;
  
      if (spans === tokens) {
        var path = new Array();
        for (var i = 0; i < l2; i++) path.push([i, i, 'N']);
        return path; 
      }
  
      if (l2 === 0){
        var path = new Array();
        for (var i = 0; i < l1; i++) path.push([i, -1, 'D']);
        return path; 
      }
   
      if (l1 === 0) {
        var path = new Array();
        for (var i = 0; i < l2; i++) path.push([-1, i, 'I']);
        return path; 
      }
  
      var i = 0, j = 0, d = [], b = [];
      for (i = 0 ; i <= l1 ; i++) {
          d[i] = [];
          d[i][0] = i;
          b[i] = [];
          b[i][0] = 'D';
      }
      for (j = 0 ; j <= l2 ; j++) {
          d[0][j] = j;
          b[0][j] = 'I';
      }
      for (i = 1 ; i <= l1 ; i++) {
          for (j = 1 ; j <= l2 ; j++) {
              var dist = (spans[i-1] === tokens[j-1])?0:1;
              if (dist > 0) {
                dist += this.editDistance(spans[i-1], tokens[j-1]);
              }
  
              d[i][j] = d[i - 1][j - 1] + dist;
              b[i][j] = ((dist > .0)?'S':'N');
  
              var ins = d[i][j - 1] + 1;
              if (ins < d[i][j]) {
                d[i][j] = ins;
                b[i][j] = 'I';
              }
  
              var del = d[i - 1][j] + 1;
              if (del < d[i][j]) { /* deletion */
                d[i][j] = del;
                b[i][j] = 'D';
              }
          }
      }
      delete b[0][0];
  
      var op = b[l1][l2];
      var path = new Array();
      while (op) {
        path.push([((op == 'I')?-1:l1-1), ((op == 'D')?-1:l2-1), op]);
        if      (op == 'S' || op == 'N') op = b[--l1][--l2];
        else if (op == 'D') op = b[--l1][  l2];
        else if (op == 'I') op = b[  l1][--l2];
      }
      return path.reverse();
    },
  
  }
})('object' === typeof module ? module : {}, this);
