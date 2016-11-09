(function() {
  var tMax = 8;
  var arrayOfGraphs = [];
  var intervals = [];
  var emptyGraph = {
    x: [],
    y: []
  };
  var polyharmonicGraph;
  
  generateIntervals();
  addNewFormForGraph();
  
  $('#save-graph').on('click', saveGraph);
  
  $('#add-new-graph-but').on('click', addNewFormForGraph);
  
  $('#forms-container').on('click', function(event) {
    if ($(event.target).hasClass('draw-graph-but')) {
      drawGraphs(event);
    }
    
    if ($(event.target).hasClass('delete-graph-but')) {
      deleteGraph(event);
    }
  });
  
  function addNewFormForGraph() {
    arrayOfGraphs.push(emptyGraph);
    
    var currentAmountOfGraphs = arrayOfGraphs.length - 1;
    
    $('#forms-container').append(`
      <div class="form">
        <input type="number" id=${"a0" + currentAmountOfGraphs} placeholder="Enter A0..." required>
        <input type="text" id=${"w0" + currentAmountOfGraphs} placeholder="Enter w0..." required>
        <input type="text" id=${"f0" + currentAmountOfGraphs} placeholder="Enter f0..." required>
        <button class="draw-graph-but">draw</button>
        <button class="delete-graph-but">delete</button>
      </div> 
    `);
  }
  
  function saveGraph() {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/send-signals',
      data: {
        signals: polyharmonicGraph.y
      }
    }).done(function() {
      alert('Saved!');
    });
  }
  
  function drawPolyharmonicGraph() {
    deleteAllTraces('polyharmonic-graph');
    
    polyharmonicGraph = {
      x: intervals,
      y: []
    };
    
    if (arrayOfGraphs.length !== 0) {
      for (var i = 0; i < intervals.length; i++) {
        var tempSum = 0;

        for (var j = 0; j < arrayOfGraphs.length; j++) {
          tempSum += arrayOfGraphs[j].y[i];
        }
        
        polyharmonicGraph.y.push(tempSum);
      }

      var lol = doFFT(polyharmonicGraph.y, generateWForDirectFFT);
      var lol1 = doFFT(lol, generateWForReverseFFT).map(function(item) {
        return item.re / tMax;
      });
      
      var kal  = {
        x: intervals,
        y: lol1
      };

      Plotly.plot('lol', [kal], {margin: {t: 0}});
      Plotly.plot('polyharmonic-graph', [polyharmonicGraph], {margin: {t: 0}});
    } else {
      Plotly.plot('polyharmonic-graph', [], {margin: {t: 0}});
    }
  }
  
  function deleteGraph(event) {
    var $parent = $(event.target).parent();
    var parentIndex = $parent.index();
    
    arrayOfGraphs.splice(parentIndex, 1);
  
    $($parent).remove();
    
    deleteAllTraces('graph');
    
    Plotly.plot('graph', arrayOfGraphs.slice(0), {margin: {t: 0}});
    
    drawPolyharmonicGraph();
  }
                        
  function drawGraphs(event) {
    deleteAllTraces('graph');
    
    var graphIndex = $(event.target).parent().index();
    
    var a0 = +$(`${'#a0' + graphIndex}`).val();
    var w0 = +$(`${'#w0' + graphIndex}`).val();
    var f0 = +$(`${'#f0' + graphIndex}`).val();

    if (isNaN(w0)) {
      eval($(`${'#w0' + graphIndex}`).val());
    }
    
    if (isNaN(f0)) {
      eval($(`${'#f0' + graphIndex}`).val());
    }

    arrayOfGraphs[graphIndex] = generateGraph(a0, w0, f0);

    Plotly.plot('graph', arrayOfGraphs.slice(0), {margin: {t: 0}});

    drawPolyharmonicGraph();
  }
  
  /*
    Hack for deleting all the traces from graph
  */
  function deleteAllTraces(graphId) { 
    try {
      while (true) {
        Plotly.deleteTraces(graphId, 0); 
      }
    } catch (err) {
      console.log(err);
    }
  }
  
  function generateIntervals() {
    var startInterval = 0;
    
    for (var i = 0; i < tMax; i++) {
      intervals.push(startInterval);
      
      startInterval += 0.05;
    }
  }
  
  function generateGraph(a0, w0, f0) {
    var signals = [];
    
    for (var i = 0; i < tMax; i++) {
      signals.push(countHarmonicSignal(a0, w0, f0, intervals[i]));
    }
    
    return {
      x: intervals,
      y: signals
    };
  }
   
  function countHarmonicSignal(a0, w0, f0, t) {
    return a0 * Math.sin(w0 * t + f0);
  }

  function generateWForDirectFFT(k, n) {
    var arg = -2 * Math.PI * k / n;

    return math.complex(Math.cos(arg), Math.sin(arg));
  }

  function generateWForReverseFFT(k,n) {
    var arg = 2 * Math.PI * k / n;

    return math.complex(Math.cos(arg), Math.sin(arg));
  }

  function doFFT(xArr, generateWCallback) {
    var xFourierResultArr = [];

    if (xArr.length === 2) {
      xFourierResultArr[0] = math.add(xArr[0], xArr[1]);
      xFourierResultArr[1] = math.subtract(xArr[0], xArr[1]);  
    } else {
      var xEvenArr = [];
      var xOddArr = [];

      for (var i = 0; i < xArr.length / 2; i++) {
        xEvenArr.push(xArr[2 * i]);
        xOddArr.push(xArr[2 * i + 1]);
      }

      var xFourierEvenArr = doFFT(xEvenArr, generateWCallback);
      var xFourierOddArr = doFFT(xOddArr, generateWCallback);

      for (i = 0; i < xArr.length / 2; i++) {
        xFourierResultArr[i] = math.add(xFourierEvenArr[i], 
                                        math.multiply(xFourierOddArr[i], generateWCallback(i, xArr.length)));
        xFourierResultArr[i + xArr.length / 2] = math.subtract(xFourierEvenArr[i], 
                                                               math.multiply(xFourierOddArr[i], generateWCallback(i, xArr.length))); 
      }

    }
    return xFourierResultArr;
  }
  
})();