(function() {
  var tMax = 1024;
  var arrayOfGraphs = [];
  $('button').on('click', function() {
    var arrOfSignals = [];
    var arrOfT = [];
    
    for (var i = 0; i < tMax; i++) {
      arrOfSignals.push(countHarmonicSignal(3, 5, 6, i));
      arrOfT.push(i);
    }
    
    Plotly.plot($('.graph')[0], [{
      x: arrOfT,
      y: arrOfSignals
    }], 
    { 
      margin: { t: 0 } 
    });
  });
  
  function countHarmonicSignal(a0, w0, f0, t) {
    return a0 * Math.sin(w0 * t + f0);
  }
  
  
})();