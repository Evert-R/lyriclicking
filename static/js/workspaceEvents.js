// ------------------------------------ Lyrics handling

// This will make the lyrics available in JS
const jsLyrics = JSON.parse(document.getElementById('js-lyrics').textContent);

// Put all the lyric hitpoints in an array for easy sorting and event triggering
let jsLyricKeys = [];
console.log(jsLyricKeys);

function collectLyricKeys(callback) {
    for (var key in jsLyrics) {
        jsLyricKeys.push(parseInt(key));
    }
    callback();
}

// callback: sort lyrickeys after change
function sortLyricKeys() {
    jsLyricKeys.sort(function (a, b) {
        return a - b;
    });
}

collectLyricKeys(sortLyricKeys);

console.log(jsLyricKeys);
// callback: set current position of lyrics after skip or slide
function repositionLyrics() {
    $('#er-lyrics').css('top', '-' + (getCurrentMs() / 7) + 'px');
    $('.er-current-line').removeClass('er-line-active');
    $('.er-line').removeClass('er-line-in er-line-out');
    jsLyricKeys.forEach(pushCurrentLine);
    pushCurrentTime();
}

// Check what the current lyric-line is and push to screen
function pushCurrentLine(position, index) {
    if (getCurrentMs() >= position && getCurrentMs() < jsLyricKeys[index + 1]) {
        $('#er-big-' + position).addClass('er-line-active');
        $('#er-big-' + jsLyricKeys[index - 1]).removeClass('er-line-active');
        $('#er-line-' + jsLyricKeys[index + 1]).addClass('er-line-in');
        $('#er-line-' + position).addClass('er-line-out');
    }
}

// set fadespeed to duration time till the next line
function setFadeSpeed(position, index) {
    let fadeTime = (jsLyricKeys[index + 1]) - position;
    $('#er-line-' + position).css('transition-duration', (fadeTime / 1000) + 's');
}


function pushAddLine(position) {
    console.log(position);
}

function addKey(position, callback) {
    jsLyricKeys.push(position);
    callback();
}

// add the line from the input to the database
function addLine() {
    console.log("create post is working!") // sanity check
    $.ajax({
        url: "lyrics/add/", // the endpoint
        type: "POST", // http method
        data: { new_line: $('#er-line-input').val() }, // data sent with the post request

        // handle a successful response
        success: function (json) {

            $('#er-line-input').val(''); // remove the value from the input

            $('#er-lyrics').append(`
            <div class="er-line" style="top:${json.position / 7}px;" id="er-line-${json.position}">
            <p>${json.line}</p>
            </div>
            <div class="er-current-line" id="er-big-${json.position}">
            <p>${json.line}</p>
            </div>            
            `)
            addKey(json.position, sortLyricKeys);
            console.log(json.position);
            console.log(json.line); // log the returned json to the console
            console.log("success"); // another sanity check
        },

        // handle a non-successful response
        error: function (json) {
            console.log(json); // log the returned json to the console
            console.log("error"); // another sanity check
        }
    });
};
wavesurfer.on('seek', function () {
    repositionLyrics();
})


// ------------------------------------ Position handling

// set default skip length
let skipLength = 1000;
$('#er-skip-length').html(skipLength);

// multiply skip length by 10
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

// divide skiplength with 10
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


// skipback skiplength in ms
function skipBack(callback) {
    wavesurfer.skip(- (skipLength / 1000));
    callback();
}

// skipforward skiplength in ms
function skipForward(callback) {
    wavesurfer.skip(skipLength / 1000);
    callback();
}


// go to selected slider position
function gotoPosition(position, callback) {
    wavesurfer.seekTo(position);
    callback();
}



// ------------------------------------ Time handling


// return seconds as MM:SS
function secondsToString(seconds) {
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 3600 % 60);
    return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2);
}

// return current position as MM:SS
function currentString() {
    let currentString = secondsToString(Math.round(wavesurfer.getCurrentTime()));
    return currentString;
}

// return current positions as ms
function getCurrentMs() {
    let currentTime = wavesurfer.getCurrentTime();
    return Math.round(currentTime * 1000);
}

// return total track time in ms
function getTotalMs() {
    let totalTime = Math.round(wavesurfer.getDuration());
    return Math.round(totalTime * 1000);
}

// push total time to screen
function pushTotalTime() {
    let totalTime = secondsToString(Math.round(wavesurfer.getDuration()));
    $('#er-total-time').html(totalTime);
}

// push the current position in ms to the input placeholder
function pushPlaceolder() {
    $('#er-line-input').attr('placeholder', 'Click to add your lyric at ' + getCurrentMs() + ' ms');
    $('#er-current-ms').html(getCurrentMs());
}

// push the current position as the value for the input
function pushCurrentEditTime() {
    $('#er-line-input').val(getCurrentMs() + ': ');
    $('#er-current-time').html(currentString());
    // $('.er-slider-play').val(getCurrentMs());
}

// push the current time to all screen items
function pushCurrentTime() {
    pushPlaceolder();
    $('#er-current-time').html(currentString());
    // $('.er-slider-play').val(getCurrentMs());
}

// ------------------------------------ Control handling

function stopPlaying(callback) {
    wavesurfer.stop();
    callback();
}

// ------------------------------------ Execute when wave is loaded
wavesurfer.on('ready', function () {
    // set slider range to total milliseconds
    // $('#er-slider-input').attr('max', getTotalMs());

    // set height of the lyrics windows
    $('#er-lyrics').css('height', (getTotalMs() / 7) + 'px');
    pushTotalTime();
    jsLyricKeys.forEach(setFadeSpeed);

    // Submit post on submit button
    $('#er-add-line').on('submit', function (event) {
        event.preventDefault();
        console.log("form submitted!")  // sanity check
        addLine();
    });

    // on click display current position as line-edit position in the input 
    $('#er-line-input').on('click', function () {
        if ($('#er-line-input').val() == '') {
            $('#er-line-input').val(getCurrentMs() + ': ');
        }
    })

    // enable button functions
    $('#er-control-backward').on('click', function () {
        skipBack(repositionLyrics);
    });

    $('#er-control-forward').on('click', function () {
        $('#er-control-backward').addClass('er-control-active');
        $('#er-control-backward').addClass('er-hover-yellow');
        skipForward(repositionLyrics);
    });

    // enable slider function
    //$('#er-slider-input').change(function () {
    //    let progress = $('#er-slider-input').val();
    //    let range = (1 / getTotalMs());
    //    let position = (range * progress);
    //    gotoPosition(position, repositionLyrics)
    //})

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
        // $('.er-slider-play').val(0);
        $('.er-current-line').removeClass('er-line-active');
        stopPlaying(repositionLyrics);
    });
});

// ------------------------------------ Execute while playing
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
            // $('#er-line-input').val('');
            // $('#er-line-input').val(getCurrentMs() + ': ');
            $('#er-control-play').removeClass('er-control-hide');
            $('#er-control-play').addClass('er-control-blink');
            $('#er-control-play').addClass('er-control-green');
            $('#er-control-play').addClass('er-hover-dark');
            $('#er-control-pause').addClass('er-control-hide');
            wavesurfer.pause();
        });

        // $('.er-slider-play').val(getCurrentMs());



        //$('#er-slider-input').on('mouseenter', function () {
        //    $('#er-slider-input').removeClass('er-slider-play');
        //})


        //$('#er-slider-input').on('mouseleave', function () {
        //    $('#er-slider-input').addClass('er-slider-play');
        //})
        jsLyricKeys.forEach(pushCurrentLine)
    }
});












