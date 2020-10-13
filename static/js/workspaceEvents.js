// This will make the lyrics available in JS
const jsLyrics = JSON.parse(document.getElementById('js-lyrics').textContent);

// Put all the lyric hitpoints in an array for easy sorting and event triggering
let jsLyricKeys = [];
jsLyricKeys.sort();
for (var key in jsLyrics) {
    jsLyricKeys.push(key);
}



function checkPosition(position, index) {
    if (getCurrentMs() >= position && getCurrentMs() < jsLyricKeys[index + 1]) {
        $('#er-big-' + position).addClass('er-line-active');
        $('#er-big-' + jsLyricKeys[index - 1]).removeClass('er-line-active');
        $('#er-line-' + position).addClass('er-line-fade');
    }
}

function gotoPosition(position, callback) {
    wavesurfer.seekTo(position);
    callback();
}

function repositionLyrics() {
    pushCurrentTime();
    $('#er-lyrics').css('top', '-' + (getCurrentMs() / 7) + 'px');
    $('.er-current-line').removeClass('er-line-active');
    $('.er-line').removeClass('er-line-fade');
    jsLyricKeys.forEach(checkPosition);
}

function secondsToString(seconds) {
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 3600 % 60);
    return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
}

function currentString() {
    let currentString = secondsToString(Math.round(wavesurfer.getCurrentTime()));
    return currentString;
}

function getCurrentMs() {
    let currentTime = wavesurfer.getCurrentTime();
    return Math.round(currentTime * 1000);
}

function getTotalMs() {
    let totalTime = Math.round(wavesurfer.getDuration());
    return Math.round(totalTime * 1000);
}



function pushTotalTime() {
    let totalTime = secondsToString(Math.round(wavesurfer.getDuration()));
    $('#er-total-time').html(totalTime);
}

function pushPlaceolder() {
    $('#er-line-input').attr('placeholder', 'Click to add your lyric at ' + getCurrentMs() + ' ms');
    $('#er-current-ms').html(getCurrentMs());
}

function pushCurrentEditTime() {
    $('#er-line-input').val(getCurrentMs() + ': ');
    $('#er-current-time').html(currentString());
    $('.er-slider-play').val(getCurrentMs());
}

function pushCurrentTime() {
    pushPlaceolder();
    $('#er-current-time').html(currentString());
    $('.er-slider-play').val(getCurrentMs());
}

let skipLength = 1000;
$('#er-skip-length').html(skipLength);

$('#er-skip-plus').on('click', function () {
    if (skipLength != 100000) {
        skipLength = skipLength * 10;
    }
    if (skipLength == 100000) {
        $('#er-skip-plus').removeClass('er-control-active')
    }
    if (skipLength == 10) {
        $('#er-skip-minus').addClass('er-control-active')
    }
    $('#er-skip-length').html(skipLength);
})

$('#er-skip-minus').on('click', function () {
    if (skipLength != 1) {
        skipLength = skipLength / 10;
    }
    if (skipLength == 1) {
        $('#er-skip-minus').removeClass('er-control-active')
    }
    if (skipLength == 10000) {
        $('#er-skip-plus').addClass('er-control-active')
    }
    $('#er-skip-length').html(skipLength);
})

function skipBack(callback) {
    wavesurfer.skip(- (skipLength / 1000));
    callback();
}

function skipForward(callback) {
    wavesurfer.skip(skipLength / 1000);
    callback();
}

function addLine() {
    console.log("create post is working!") // sanity check
    $.ajax({
        url: "lyrics/add/", // the endpoint
        type: "POST", // http method
        data: { new_line: $('#er-line-input').val() }, // data sent with the post request

        // handle a successful response
        success: function (json) {
            $('#er-line-input').val(''); // remove the value from the input
            console.log(json); // log the returned json to the console
            console.log("success"); // another sanity check
        },

        // handle a non-successful response
        error: function (json) {
            console.log(json); // log the returned json to the console
            console.log("error"); // another sanity check
        }
    });
};

window.onload = function () {

    // Submit post on submit
    $('#er-add-line').on('submit', function (event) {
        event.preventDefault();
        console.log("form submitted!")  // sanity check
        addLine();
    });


    $('#er-line-input').on('click', function () {
        if ($('#er-line-input').val() == '') {
            $('#er-line-input').val(getCurrentMs() + ': ');
        }
    })

    $('#er-control-backward').on('click', function () {
        skipBack(repositionLyrics);
    });

    $('#er-control-forward').on('click', function () {
        $('#er-control-backward').addClass('er-control-active');
        $('#er-control-backward').addClass('er-hover-yellow');
        skipForward(repositionLyrics);
    });



    $('#er-slider-input').change(function () {
        let progress = $('#er-slider-input').val();
        let range = (1 / getTotalMs());
        let position = (range * progress);
        gotoPosition(position, repositionLyrics)
    })


};



wavesurfer.on('ready', function () {
    pushTotalTime();
    // Activate play and forward
    $('#er-control-play').addClass('er-control-active');
    $('#er-control-forward').addClass('er-control-active');
    $('#er-control-forward').addClass('er-hover-yellow');
    $('#er-control-play').addClass('er-hover-green');


    // activate stop, backwards, hide play, show pause
    $('#er-control-play').on('click', function () {
        $('#er-line-input').val('');
        $('#er-control-play').addClass('er-control-hide');
        $('#er-control-pause').removeClass('er-control-hide');
        $('#er-control-pause').addClass('er-control-green');
        $('#er-control-pause').addClass('er-hover-dark');
        wavesurfer.play();

    });

    // show play, rewind track
    $('#er-control-stop').on('click', function () {
        $('#er-control-play').removeClass('er-control-hide');
        $('#er-control-play').removeClass('er-control-green');
        $('#er-control-play').removeClass('er-control-blink');
        $('#er-control-pause').addClass('er-control-hide');
        $('#er-control-stop').addClass('er-control-blue');
        $('#er-control-backward').removeClass('er-control-active');
        $('#er-control-backward').removeClass('er-hover-yellow');
        $('.er-slider-play').val(0);
        $('.er-current-line').removeClass('er-line-active');
        wavesurfer.stop();
    });

    // set slider range to total milliseconds
    $('#er-slider-input').attr('max', getTotalMs());

    // set height of the lyrics windows
    $('#er-lyrics').css('height', (getTotalMs() / 7) + 'px');
});

wavesurfer.on('audioprocess', function () {
    if (wavesurfer.isPlaying()) {
        // 
        $('#er-current-time').html(currentString());
        pushPlaceolder();
        $('#er-lyrics').css('top', '-' + (getCurrentMs() / 7) + 'px');

        $('#er-control-backward').addClass('er-control-active');

        $('#er-control-stop').addClass('er-control-active');
        $('#er-control-stop').addClass('er-hover-blue');
        $('#er-control-stop').removeClass('er-control-blue');

        $('#er-control-play').removeClass('er-control-blink');
        $('#er-control-pause').on('click', function () {
            $('#er-line-input').val('');
            // $('#er-line-input').val(getCurrentMs() + ': ');
            $('#er-control-play').removeClass('er-control-hide');
            $('#er-control-play').addClass('er-control-blink');
            $('#er-control-play').addClass('er-control-green');
            $('#er-control-play').addClass('er-hover-dark');
            $('#er-control-pause').addClass('er-control-hide');
            wavesurfer.pause();
        });

        $('.er-slider-play').val(getCurrentMs());



        $('#er-slider-input').on('mouseenter', function () {
            $('#er-slider-input').removeClass('er-slider-play');
        })


        $('#er-slider-input').on('mouseleave', function () {
            $('#er-slider-input').addClass('er-slider-play');
        })





        jsLyricKeys.forEach(checkPosition)

    }
});












