(function() {
  var tMax = 1024;
  var arrayOfGraphs = [];
  var intervalsForSignals = generateIntervals(0.05);
  var intervalsForResponses = generateIntervals(1);
  var emptyGraph = {
    x: intervalsForSignals,
    y: Array.apply(null, new Array(tMax)).map(function(){ return 0;})
  };
  var polyharmonicGraph;
  
  addNewFormForGraph();
  
   $('#save-graph').on('click', savePolyharmonicGraphToFile);

  // $('#get-graph').on('click', getPolyharmonicGraphFromFile);

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
        <label for="${"a0" + currentAmountOfGraphs}">A0: </label>
        <input type="number" id=${"a0" + currentAmountOfGraphs} placeholder="Enter A0...">
        <label for="${"w0" + currentAmountOfGraphs}">omega0: </label>
        <input type="text" id=${"w0" + currentAmountOfGraphs} placeholder="Enter w0...">
        <label for="${"f0" + currentAmountOfGraphs}">phi0: </label>
        <input type="text" id=${"f0" + currentAmountOfGraphs} placeholder="Enter f0...">
        <button class="draw-graph-but">Draw</button>
        <button class="delete-graph-but">Delete</button>
      </div> 
    `);
  }
  
  function savePolyharmonicGraphToFile() {
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

  function getPolyharmonicGraphFromFile() {
    $.ajax({
      type: 'GET',
      url: 'http://localhost:3000/get-signals'
    }).done(function(response) {
      
    });
  }
  
  function drawPolyharmonicGraph() {
    deleteAllTraces('polyharmonic-graph');
    
    if (arrayOfGraphs.length !== 0) {
      generatePolyharmonicGraph();

      drawResponsesGraphs();

      Plotly.plot('polyharmonic-graph', [polyharmonicGraph], {margin: {t: 0}});
    } else {
      Plotly.plot('polyharmonic-graph', [], {margin: {t: 0}});
    }
  }
  
  function drawResponsesGraphs() {
    deleteAllTraces('frequency-response-graph');
    deleteAllTraces('phase-response-graph');
    deleteAllTraces('inverse-fft-graph');

    var fourierSequence = doFFT(polyharmonicGraph.y, -1);
    
    var fourierSequenceAfterInverseFFT = doFFT(fourierSequence, 1);

    var polyharmonicGraphAfterInverseFFT = {
      x: intervalsForSignals,
      y: fourierSequenceAfterInverseFFT.map(function(item) {
        return item.re / tMax;
      })
    };

    var frequencyResponse = fourierSequence.map(function(item) {
      return math.sqrt(math.pow(item.re, 2) + math.pow(item.im, 2));
    });

    var phaseResponse = fourierSequence.map(function(item) {
      return math.atan(item.im  / item.re);
    });

    var frequencyResponseGraph = {
      x: intervalsForResponses,
      y: frequencyResponse
    };

    var phaseResponseGraph = {
      x: intervalsForResponses,
      y: phaseResponse
    };

    Plotly.plot('frequency-response-graph', [frequencyResponseGraph], {margin: {t: 0}});
    Plotly.plot('phase-response-graph', [phaseResponseGraph], {margin: {t: 0}});
    Plotly.plot('inverse-fft-graph', [polyharmonicGraphAfterInverseFFT], {margin: {t: 0}});

  }
  
  function deleteGraph(event) {
    var $parent = $(event.target).parent();
    var parentIndex = $parent.index();
    
    if (parentIndex !== arrayOfGraphs.length - 1) {
      var $forms = $('.form');

      for (var i = parentIndex + 1; i < arrayOfGraphs.length; i++) {
        var $labels = $($forms[i]).find('label');

        $($labels[0]).attr('for', 'a0' + (i - 1));
        $($labels[1]).attr('for', 'w0' + (i - 1));
        $($labels[2]).attr('for', 'f0' + (i - 1));

        var $inputs = $($forms[i]).find('input');

        $($inputs[0]).attr('id', 'a0' + (i - 1));
        $($inputs[1]).attr('id', 'w0' + (i - 1));
        $($inputs[2]).attr('id', 'f0' + (i - 1));
      }
    }

    arrayOfGraphs.splice(parentIndex, 1);
    
    $($parent).remove();
    
    deleteAllTraces('graphs');
    
    Plotly.plot('graphs', arrayOfGraphs.slice(0), {margin: {t: 0}});
    
    drawPolyharmonicGraph();

    if (arrayOfGraphs.length === 0) {
      $('.graphs-container').removeClass('showed');
    }
  }
                        
  function drawGraphs(event) {
    deleteAllTraces('graphs');
    
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

    if (!$('.graphs-container').hasClass('showed')) {
      $('.graphs-container').addClass('showed');
    }

    arrayOfGraphs[graphIndex] = generateGraph(a0, w0, f0);

    Plotly.plot('graphs', arrayOfGraphs.slice(0), {margin: {t: 0}});

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
    } catch (err) {}
  }
  
  function generateIntervals(step) {
    var startInterval = 0;
    var tempArr = [];

    for (var i = 0; i < tMax; i++) {
      tempArr.push(startInterval);
      
      startInterval += step;
    }

    return tempArr;
  }
  
  function generateGraph(a0, w0, f0) {
    var signals = [];
    
    for (var i = 0; i < tMax; i++) {
      signals.push(countHarmonicSignal(a0, w0, f0, intervalsForSignals[i]));
    }
    
    return {
      x: intervalsForSignals,
      y: signals
    };
  }
  
  function generatePolyharmonicGraph() {
    polyharmonicGraph = {
      x: intervalsForSignals,
      y: []
    };

    for (var i = 0; i < intervalsForSignals.length; i++) {
      var tempSum = 0;

      for (var j = 0; j < arrayOfGraphs.length; j++) {
        tempSum += arrayOfGraphs[j].y[i];
      }
      
      polyharmonicGraph.y.push(tempSum);
    }
  }

  function countHarmonicSignal(a0, w0, f0, t) {
    return a0 * math.sin(w0 * t + f0);
  }

  /*
    typeOfFourierTransformRatio param equal -1 if it's direct FFT and equal 1 if it's inverse 
  */
  function doFFT(xArr, typeOfFourierTransformRatio) {
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

      var xFourierEvenArr = doFFT(xEvenArr, typeOfFourierTransformRatio);
      var xFourierOddArr = doFFT(xOddArr, typeOfFourierTransformRatio);

      for (var i = 0; i < xArr.length / 2; i++) {
        var arg = 2 * typeOfFourierTransformRatio * math.PI * i / xArr.length;
        var w = math.complex(math.cos(arg), math.sin(arg));

        xFourierResultArr[i] = math.add(xFourierEvenArr[i], math.multiply(xFourierOddArr[i], w));
        xFourierResultArr[i + xArr.length / 2] = math.subtract(xFourierEvenArr[i], math.multiply(xFourierOddArr[i], w)); 
      }

    }
    return xFourierResultArr;
  } 
})();