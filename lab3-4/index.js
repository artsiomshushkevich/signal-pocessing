(() => {
    let fileReader = new FileReader();
    let context = new AudioContext();
    let gainNode = context.createGain();
    let canvasWidth = $('#visualizer').width();
    let canvasHeight = $('#visualizer').height();

    let source, balanceFilters, frequencyFilter, analyser, requestId, signalsForSaving;

    fileReader.onload = (event) => {
        let buffer = event.srcElement.result;

        context.decodeAudioData(buffer, (audioBuffer) => {
            source = context.createBufferSource(); 
            source.buffer = audioBuffer;
            source.loop = true;

            balanceFilters = createBalanceFilters();
            frequencyFilter = createFrequencyFilter();

            analyser = context.createAnalyser();
            analyser.fftSize = 4096;
        
            source.connect(balanceFilters[0]);
            balanceFilters[balanceFilters.length - 1].connect(frequencyFilter);
            frequencyFilter.connect(gainNode); 
            gainNode.connect(analyser);
            analyser.connect(context.destination);
            source.start(0);   

            requestId = requestAnimationFrame(draw);
         
        });             
    };

    function draw() {
        let canvasContext = $('#visualizer')[0].getContext('2d');
        canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
     
        let frequencies = new Uint8Array(analyser.frequencyBinCount);
        let times = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencies);
        analyser.getByteTimeDomainData(times);

        for (let i = 0; i < analyser.frequencyBinCount; i++) {
            var height = (frequencies[i] / 256) * canvasHeight;
            var offset = canvasHeight - height;
            var barWidth = canvasWidth/analyser.frequencyBinCount;
            canvasContext.fillStyle = '#2c3e50';
            canvasContext.fillRect(i * barWidth, offset, barWidth, height);
        }

        for (let i = 0; i < analyser.frequencyBinCount; i++) {
            var height =  (times[i] / 256) * canvasHeight;
            var offset = canvasHeight - height - 1;
            var barWidth = canvasWidth / analyser.frequencyBinCount;
            canvasContext.fillStyle = 'red';
            canvasContext.fillRect(i * barWidth, offset, 1, 2);
        }

        requestId = requestAnimationFrame(draw);
    }

    $('#send-signals').on('click', () => {
        signalsForSaving = new Float32Array(analyser.frequencyBinCount);
        analyser.getFloatTimeDomainData(signalsForSaving);

        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/send-signals',
            data: {
                signals: signalsForSaving
            }
        }).done(() => alert('Done!'));
    });


    $('#smoothing').on('change', (event) => {
        analyser.smoothingTimeConstant = +event.target.value;
    });

    $('#play-but').on('click', () => {  
        let file = $('#file-picker')[0].files[0];

        if (!file) {
            alert("There aren't any choosen .wav files!");
            return;
        }

        fileReader.readAsArrayBuffer(file); 
    });
    
    $('#stop-but').on('click', () => {
        source.stop();
        cancelAnimationFrame(requestId);
    });

    $('#volume-range').on('change', (event) => {
        gainNode.gain.value = event.target.value / event.target.max;
    });

    $('.equalizer-controls input[type=range]').each((index, item) => {
        $(item).on('change', (event) => {
            balanceFilters[index].gain.value = +event.target.value;
        });
    });

    $('#radio-family-container').on('click', (event) => {
        if (event.target.tagName === "INPUT") {
            frequencyFilter.type = event.target.value;   
        }
    });

    $('.filters-controls input[type=range]').on('change', (event) => {
        frequencyFilter.frequency.value = +event.target.value;
    });

    function createFrequencyFilter() {
        let filter = context.createBiquadFilter();

        filter.type = "highpass";
        filter.frequency.value = 0;
        filter.frequency.Q = 1;

        return filter
    }

    function createBalanceFilter(frequency) {
        let filter = context.createBiquadFilter();
            
        filter.type = 'peaking';
        filter.frequency.value = frequency; 
        filter.Q.value = 1; 
        filter.gain.value = 0;

        return filter;
    }

    function createBalanceFilters() {
        let frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
        let balanceFilters = frequencies.map(createBalanceFilter);

        balanceFilters.reduce(function (prev, curr) {
            prev.connect(curr);
            return curr;
        });

        return balanceFilters;
    }
})();
