(function() {
  var tMax = 1024;
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
      drawGraph(event);
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
        <input type="number" id=${"w0" + currentAmountOfGraphs} placeholder="Enter w0..." required>
        <input type="number" id=${"a" + currentAmountOfGraphs} placeholder="Enter a for f0..." required>
        <input type="number" id=${"b" + currentAmountOfGraphs} placeholder="Enter b for f0..." required>
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
                        
  function drawGraph(event) {
    deleteAllTraces('graph');
    
    var graphIndex = $(event.target).parent().index();
    
    var a0 = +$(`${'#a0' + graphIndex}`).val();
    var w0 = +$(`${'#w0' + graphIndex}`).val();
    var a = +$(`${'#a' + graphIndex}`).val();
    var b = +$(`${'#b' + graphIndex}`).val();
    
    arrayOfGraphs[graphIndex] = generateGraph(a0, w0, a, b);
    
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
  
  function generateGraph(a0, w0, a, b) {
    var signals = [];
    
    for (var i = 0; i < tMax; i++) {
      signals.push(countHarmonicSignal(a0, w0, a, b, intervals[i]));
    }
    
    return {
      x: intervals,
      y: signals
    };
  }
   
  function countHarmonicSignal(a0, w0, a, b, t) {
    return a0 * Math.sin(w0 * t + (a * t + b));
  }
})();