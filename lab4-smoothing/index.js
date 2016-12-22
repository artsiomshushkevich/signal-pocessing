(() => {
    const B1 = 7;
    const B2 = 8879;
    const N = 2048;
    let signals = [];
    let intervals = [];
    let smootingType = 'none';


    $('#actions-container').on('click', (event) => {
        if (event.target.tagName === "INPUT") {
            smootingType = event.target.value;   
        } else if (event.target.tagName === "BUTTON") {
            drawGraph();
        }
    });

    function drawGraph() {
        clearGraphsData();
        deleteAllTraces('graph');

        let currentInterval = 0;

        for (let i = 0; i < N; i++) {
            signals.push(generateSignal(i));
            intervals.push(currentInterval);

            currentInterval += 0.05;
        }
        
        switch (smootingType) {
            case 'averaging':
                signals = doAveragingSmoothing(signals);
                break;
            case 'median':
                signals = doMedianSmoothing(signals);
                break;
            case 'parabolic':
                signals = doParabolicSmoothing(signals);
                break;
        };

        Plotly.plot('graph', [{x: intervals, y: signals}], {margin: {t: 0}});
    }
   
    function doAveragingSmoothing(signals) {
        let K = 5;
        let m = (K - 1) / 2;
        let newSignals = [];

        for (let i = 0; i < signals.length; i++) {
            let tempXi = 0;

            for (let j = i - m; j < i + m; j++) {
                tempXi += signals[j] ? signals[j] : 0;
            }

            newSignals.push(1 / K * tempXi);
        }

        return newSignals;

    }

    function doParabolicSmoothing(signals) {
        let newSignals = [];

        for (let i = 0; i < signals.length; i++) {         
            let tempXi = 1 / 35 * ((-3) * (signals[i - 2] ? signals[i - 2] : 0) + 
                                12 * (signals[i - 1] ? signals[i - 1] : 0) + 
                                17 * (signals[i] ? signals[i] : 0) +
                                12 * (signals[i + 1] ? signals[i + 1] : 0) +   
                                (-3) * (signals[i + 2] ? signals[i + 2] : 0));
            
            newSignals.push(tempXi);
        }

        return newSignals; 
    }

    function doMedianSmoothing(signals) {
        let newSignals = signals.slice();
        let N = 5;

        for (let i = 0; i < signals.length - N; i++) {
            var signalsWindow = signals.slice(i, i + N);
            signalsWindow.sort();

            newSignals[i + Math.round(N / 2)] = signalsWindow[Math.round(N / 2)];
        }
        
        return newSignals;
    }

    function deleteAllTraces(graphId) { 
        try {
            while (true) {
                Plotly.deleteTraces(graphId, 0); 
            }
        } catch (err) {}
    }
  
    function clearGraphsData() {
        signals = [];
        intervals = [];
    }

    function generateSignal(i) {
        let xi = B1 * Math.sin(2 * Math.PI * i / N);
        
        for (let j = 50; j < 70; j++)  {
            xi += Math.pow(-1, Math.floor(Math.random() * 100 + 100)) * B2 * Math.sin(2 * Math.PI * i * j / N);
        }

        return xi;
    }

 })();