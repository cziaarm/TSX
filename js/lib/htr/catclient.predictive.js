(function(module, global){

  var CatClient = require("catclient");
  var PredictiveCatClient = CatClient;

  $.extend(PredictiveCatClient.prototype, {

    /** 
    * Start predictive session.
    * @param {Object}
    * @setup obj
    *   source {String}
    * @trigger startSessionResult
    * @return {Object} 
    *   errors {Array} List of error messages
    *   data {Object}
    *   @setup data
    *     elapsedTime {Number} ms
    */
    startSession: function(obj) {
      this.checkConnection();
      this.server.emit('startSession', {data: obj});
    },

    /** 
    * Send decoding results for the current segment.
    * @param {Object}
    * @setup obj
    *   target {String} Segment text
    *   caretPos {Number} Index position of caret cursor
    *   [numResults] {Number} How many results should be retrieved (default: 1)
    * @trigger setPrefixResult
    * @return {Object} 
    *   errors {Array} List of error messages
    *   data {Object}
    *   @setup data
    *     source {String} Verified source
    *     sourceSegmentation {Array} Verified source segmentation
    *     elapsedTime {Number} ms
    *     nbest {Array} List of objects
    *     @setup nbest
    *       target {String} Result
    *       targetSegmentation {Array} Segmentation of result
    *       elapsedTime {Number} ms Time to process each resuls
    *       [author] {String} Technique or person that generated the target result
    *       [alignments] {Array} Dimensions: source * target
    *       [confidences] {Array} List of floats for each token
    *       [quality] {Number} Quality measure of overall hypothesis
    *       [priorities] {Array} List of integers, where each integer indicates a group of tokens
    */  
    setPrefix: function(obj) {
      this.checkConnection();
      this.server.emit('setPrefix', {data: obj});
    },

    /** 
    * Reject received suffix for the current segment.
    * @param {Object}
    * @setup obj
    *   target {String} Segment text
    *   caretPos {Number} Index position of caret cursor
    *   [numResults] {Number} How many results should be retrieved (default: 1)
    * @trigger rejectSuffixResult
    * @return {Object} 
    *   errors {Array} List of error messages
    *   data {Object}
    *   @setup data
    *     source {String} Verified source
    *     sourceSegmentation {Array} Verified source segmentation
    *     caretPos {Number} Verified index position of caret cursor
    *     elapsedTime {Number} ms
    *     nbest {Array} List of objects
    *     @setup nbest
    *       target {String} Result
    *       targetSegmentation {Array} Segmentation of result
    *       elapsedTime {Number} ms Time to process each resuls
    *       [author] {String} Technique or person that generated the target result
    *       [alignments] {Array} Dimensions: source * target
    *       [confidences] {Array} List of floats for each token
    *       [quality] {Number} Quality measure of overall hypothesis
    *       [priorities] {Array} List of integers, where each integer indicates a group of tokens
    */  
    rejectSuffix: function(obj) {
      this.checkConnection();
      this.server.emit('rejectSuffix', {data: obj});
    },

    /** 
    * End predictive session for the current segment.
    * @trigger endSessionResult
    * @return {Object} 
    *   errors {Array} List of error messages
    *   data {Object}
    *   @setup data
    *     elapsedTime {Number} ms
    */
    endSession: function() {
      this.checkConnection();
      this.server.emit('endSession');
    },

  });

  // Expose
  //exports.PredictiveCatClient = global.PredictiveCatClient = PredictiveCatClient;
  module.exports = PredictiveCatClient;

})('object' === typeof module ? module: {}, this);
