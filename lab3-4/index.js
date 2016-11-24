(() => {
    $('#play-but').on('click', () => {
        let audio = new Audio('../Kazantip.wav');
        audio.play();
    });
})();
