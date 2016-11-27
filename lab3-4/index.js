(() => {
    let fileReader = new FileReader();
    let context = new AudioContext();
    let gainNode = context.createGain();

    let buffer;

    fileReader.onload = (event) => {
        buffer = event.srcElement.result;

        context.decodeAudioData(buffer, (audioBuffer) => {
            let source = context.createBufferSource(); 
            source.buffer = audioBuffer;

            source.connect(gainNode); 
            gainNode.connect(context.destination);                
            // source.connect(context.destination);    
            source.start(0);   
        });             
    };
        
    $('#play-but').on('click', () => {
        let file = $('#file-picker')[0].files[0];

        if (!file) {
            alert("There aren't any choosen .wav files!");
            return;
        }

        fileReader.readAsArrayBuffer(file);
    });
    
    $('#volume-range').on('change', (event) => {
        gainNode.gain.value = event.target.value / event.target.max;
    });
    // let context = new AudioContext();
    // let player = new Audio();
    // player.crossOrigin = true;
    // player.src = './Kazantip.wav'

    // initEqualzier(player);

    // function createFilter(frequency) {
    //     let filter = context.createBiquadFilter();
            
    //     filter.type = 'peaking';
    //     filter.frequency.value = frequency; 
    //     filter.Q.value = 1; 
    //     filter.gain.value = 0;

    //     return filter;
    // }

    // function createFilters() {
    //     let frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
    //     let filters = frequencies.map(createFilter);

    //     filters.reduce(function (prev, curr) {
    //         prev.connect(curr);
    //         return curr;
    //     });

    //     return filters;
    // }

    // function initEqualzier(player) {
    //     //let source = context.createMediaElementSource(player);
    //     // let filters = createFilters();
        
    //     // $('input[type=range]').each((index, item) => {
    //     //     $(item).on('change', (event) => {
    //     //         filters[index].gain.value = +event.target.value;
    //     //     });
    //     // });

    // //    source.connect(context.destination);
    //     player.play();
    //     // filters[filters.length - 1].connect(context.destination);
    // };

})();
