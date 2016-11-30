(() => {
    let fileReader = new FileReader();
    let context = new AudioContext();
    let gainNode = context.createGain();
    let source, balanceFilters, frequencyFilter;

    fileReader.onload = (event) => {
        let buffer = event.srcElement.result;

        context.decodeAudioData(buffer, (audioBuffer) => {
            source = context.createBufferSource(); 
            source.buffer = audioBuffer;
            source.loop = true;

            balanceFilters = createBalanceFilters();
            frequencyFilter = createFrequencyFilter();

            source.connect(balanceFilters[0]);
            balanceFilters[balanceFilters.length - 1].connect(frequencyFilter);
            frequencyFilter.connect(gainNode); 
            gainNode.connect(context.destination);

            source.start(0);   
        });             
    };

    $('#lol').on('change', (event) => {
        filter.gain.value = +event.target.value;
    });

    $('#play-but').on('click', () => {  
        let file = $('#file-picker')[0].files[0];

        if (!file) {
            alert("There aren't any choosen .wav files!");
            return;
        }

        fileReader.readAsArrayBuffer(file); 
    });
    
    $('#stop-but').on('click', () => source.stop());

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
