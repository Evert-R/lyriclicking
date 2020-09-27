function pushTotalTime() {
    let totalTime = secondsToString(Math.round(wavesurfer.getDuration()));
    $('#er-total-time').html(totalTime);
}

function pushPlaceolder() {
    $('#er-line-input').attr('placeholder', 'Click to add your lyric at ' + currentMs() + ' ms');
}

function secondsToString(seconds) {
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 3600 % 60);
    return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
}

function currentMs() {
    let currentTime = wavesurfer.getCurrentTime();
    return Math.round(currentTime * 1000);
}

function getTotalMs() {
    let totalTime = Math.round(wavesurfer.getDuration());
    return Math.round(totalTime * 1000);
}

function currentString() {
    let currentString = secondsToString(Math.round(wavesurfer.getCurrentTime()));
    return currentString;
}

window.onload = function () {
    wavesurfer.on('ready', function () {
        pushTotalTime();

        $('#er-control-play').addClass('er-control-active');
        $('#er-control-forward').addClass('er-control-active');
        $('#er-control-forward').addClass('er-hover-yellow');
        $('#er-control-play').addClass('er-hover-green');



        $('#er-control-play').on('click', function () {
            $('#er-line-input').val('');
            $('#er-control-play').addClass('er-control-hide');
            $('#er-control-pause').removeClass('er-control-hide');
            $('#er-control-pause').addClass('er-control-green');
            $('#er-control-pause').addClass('er-hover-dark');
            wavesurfer.play();

        });

        $('#er-control-stop').on('click', function () {
            $('#er-control-play').removeClass('er-control-hide');
            $('#er-control-play').removeClass('er-control-green');
            $('#er-control-play').removeClass('er-control-blink');
            $('#er-control-pause').addClass('er-control-hide');
            $('#er-control-stop').addClass('er-control-blue');
            $('#er-control-backward').removeClass('er-control-active');
            $('#er-control-backward').removeClass('er-hover-yellow');
            $('.er-slider-play').val(0);
            wavesurfer.stop();
        });

        $('#er-slider-input').attr('max', getTotalMs());


    });
};




wavesurfer.on('audioprocess', function () {
    if (wavesurfer.isPlaying()) {
        $('#er-current-time').html(currentString());
        pushPlaceolder();

        $('#er-control-backward').addClass('er-control-active');

        $('#er-control-stop').addClass('er-control-active');
        $('#er-control-stop').addClass('er-hover-blue');
        $('#er-control-stop').removeClass('er-control-blue');

        $('#er-control-play').removeClass('er-control-blink');
        $('#er-control-pause').on('click', function () {
            $('#er-line-input').val('');
            // $('#er-line-input').val(currentMs() + ': ');
            $('#er-control-play').removeClass('er-control-hide');
            $('#er-control-play').addClass('er-control-blink');
            $('#er-control-play').addClass('er-control-green');
            $('#er-control-play').addClass('er-hover-dark');
            $('#er-control-pause').addClass('er-control-hide');
            wavesurfer.pause();
        });

        $('.er-slider-play').val(currentMs());



        $('#er-slider-input').on('mouseenter', function () {
            $('#er-slider-input').removeClass('er-slider-play');
        })


        $('#er-slider-input').on('mouseleave', function () {
            $('#er-slider-input').addClass('er-slider-play');
        })

        $('#er-control-backward').on('click', function () {

            pushCurrentTime();
        });
        $('#er-control-forward').on('click', function () {

            pushCurrentTime();
        });


    }
});


function pushCurrentEditTime() {
    $('#er-line-input').val(currentMs() + ': ');
    $('#er-current-time').html(currentString());
    $('.er-slider-play').val(currentMs());
}

function pushCurrentTime() {
    pushPlaceolder();
    $('#er-current-time').html(currentString());
    $('.er-slider-play').val(currentMs());
}





$('#er-line-input').on('click', function () {
    $('#er-line-input').val(currentMs() + ': ');
})

$('#er-control-backward').on('click', function () {
    wavesurfer.skipBackward();

});
$('#er-control-forward').on('click', function () {
    wavesurfer.skipForward();
    $('#er-control-backward').addClass('er-control-active');
    $('#er-control-backward').addClass('er-hover-yellow');

});



$('#er-slider-input').change(function () {
    let progress = $('#er-slider-input').val();
    let range = (1 / getTotalMs());
    let slide = (range * progress);
    wavesurfer.seekTo(slide);
    pushPlaceolder();
})