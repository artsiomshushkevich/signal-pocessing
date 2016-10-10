(function() {
  var tMax = 1024;
  var arrayOfGraphs = [];
  var intervals = [];
  var emptyGraph = {
    x: [],
    y: []
  };
  
  generateIntervals();
  addNewFormForGraph();
  
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
        <input type="number" id=${"f0" + currentAmountOfGraphs} placeholder="Enter f0..." required>
        <button class="draw-graph-but">draw</button>
        <button class="delete-graph-but">delete</button>
      </div> 
    `);
  }
  
  function deleteGraph(event) {
    var $parent = $(event.target).parent();
    var parentIndex = $parent.index();
    
    arrayOfGraphs.splice(parentIndex, 1);
  
    $($parent).remove();
    
    deleteAllTraces();
    
    Plotly.plot('graph', arrayOfGraphs.slice(0), {margin: {t: 0}});
  }
                        
  function drawGraph(event) {
    deleteAllTraces();
    
    var graphIndex = $(event.target).parent().index();
    
    var a0 = +$(`${'#a0' + graphIndex}`).val();
    var w0 = +$(`${'#w0' + graphIndex}`).val();
    var f0 = +$(`${'#f0' + graphIndex}`).val();
    
    arrayOfGraphs[graphIndex] = generateGraph(a0, w0, f0);
    
    Plotly.plot('graph', arrayOfGraphs.slice(0), {margin: {t: 0}});
  }
  
  /*
    Hack for deleting all the traces from graph
  */
  function deleteAllTraces() { 
    try {
      while (true) {
        Plotly.deleteTraces('graph', 0); 
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
})();