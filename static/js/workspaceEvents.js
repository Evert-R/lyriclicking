// true when editing a lyric
let editLyric = false;

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
    repositionLyrics();
}

collectLyricKeys(sortLyricKeys);



function addLine(position, line, user, date, callback) {
    jsLyrics[position] = {
        'line': line,
        'user': user,
        'date': date,
    }
    jsLyricKeys.push(position);
    $('#er-lyrics').append(`
    <div class="er-line" style="top:${position / 7}px;" id="er-line-${position}">
    <p>${line}</p>
    </div>                         
    `)
    console.log('key added');
    callback();
}

function removeLine(position) {
    const index = jsLyricKeys.indexOf(position);
    jsLyricKeys.splice(index, 1);
    delete jsLyrics[position];
    $('#er-line-' + position).html('');
    console.log('key removed');
}

function updateLine(position, line, callback) {
    let match = false;
    jsLyricKeys.forEach(function (item, index) {
        if (parseInt(position) == parseInt(item)) {
            $('#er-line-' + position + '> p').html(line);
            match = true;
            jsLyrics[position].line = line;
            console.log('lyric updated')
        }
    })
    if (match == false) {
        return true;
    }
    callback();
}



// add the line from the input to the database
function inputLine() {
    console.log($('#er-line-input').val()) // sanity check
    console.log($('#er-input-position').val()) // sanity check
    $.ajax({
        url: "lyrics/add/", // the endpoint
        type: "POST", // http method
        data: {
            input_line: $('#er-line-input').val(),
            input_position: $('#er-input-position').val(),
            original_position: $('#er-original-position').val()
        }, // data sent with the post request

        // handle a successful response
        success: function (json) {
            lyricEditModeOff();

            if (json.prev_position != -1) {
                removeLine(json.prev_position);
            }

            if (updateLine(json.position, json.line, repositionLyrics)) {
                addLine(json.position, json.line, json.user, json.date, sortLyricKeys);
                console.log('Lyrcic added');
            }

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

console.log(jsLyricKeys);

// set fadespeed to duration time till the next line
function setFadeSpeed(position, index) {
    let fadeTime = (jsLyricKeys[index + 1]) - position;
    $('#er-line-' + position).css('transition-duration', (fadeTime / 1000) + 's');
}

// callback: set current position of lyrics after skip or slide
function repositionLyrics() {
    $('#er-lyrics').css('top', '-' + (getCurrentMs() / 7) + 'px');
    $('.er-current-line').removeClass('er-line-active');
    $('.er-line').removeClass('er-line-in er-line-out');
    jsLyricKeys.forEach(pushCurrentLine);
    pushCurrentTime();
}

let activePosition = 0;
let activeLine = '';
// Check what the current lyric-line is and push to screen
function pushCurrentLine(position, index) {
    if (getCurrentMs() >= position && getCurrentMs() < jsLyricKeys[index + 1]) {
        activePosition = position;
        activeLine = jsLyrics[position].line;

        $('#er-line-' + jsLyricKeys[index + 1]).addClass('er-line-in');
        $('#er-line-' + position).addClass('er-line-out');
        $('#er-current-line').html(jsLyrics[position].line);
        $('#er-active-line').html(jsLyrics[position].line);
        $('.er-edit-row').removeClass('er-hide');
        pushActivePosition(position);

    }
}

let updateLyric = false;

function pushActivePosition(position) {
    if (editLyric == false) {
        $('#er-active-position').html(secondsToString(position / 1000));
    }
}

// ------------------------------------ Edit modes

$('#er-edit-current').on('click', function () {
    if (editLyric == false) {
        lyricEditMode();
    } else {
        lyricEditModeOff();
    }
})

$('#er-cancel-input').on('click', function () {
    lyricEditModeOff();
})

function lyricAddMode() {
    editLyric = true;
    let position = getCurrentMs();
    $('#er-active-position').html(secondsToString(position / 1000));
    $('#er-active-position').addClass('er-blink');
    $('#er-input-position').val(position);
    $('#er-edit-position').html(secondsToString(position / 1000));
    $('#er-line-input').attr('placeholder', '');
    $('.er-input-helpers').removeClass('er-hide');
    $('#er-edit-current').addClass('er-control-red');
    $('.er-input-row').addClass('er-active-button');
    $('.er-skip-status').addClass('er-red');
    $('.er-skip-status').addClass('er-blink');
}

function lyricEditMode() {
    editLyric = true;
    $('#er-line-input').val(activeLine);
    $('#er-edit-position').html(secondsToString(activePosition / 1000));
    $('#er-input-position').val(activePosition);
    $('#er-original-position').val(activePosition);
    $('#er-edit-current').addClass('er-control-red');
    $('.er-input-row').addClass('er-active-button');
    $('.er-input-helpers').removeClass('er-hide');
    $('#er-line-input').attr('placeholder', '');
    $('#er-edit-right').addClass('er-edit-red');
    $('#er-active-position').addClass('er-blink');
    $('.er-skip-status').addClass('er-red');
    $('.er-skip-status').addClass('er-blink');
}

function lyricEditModeOff() {
    editLyric = false;
    $('#er-edit-current').removeClass('er-control-red');
    $('.er-input-row').removeClass('er-active-button');
    $('#er-line-input').val('');
    $('#er-edit-position').html('');
    $('#er-original-position').val('-1');
    $('.er-input-helpers').addClass('er-hide');
    $('#er-edit-right').removeClass('er-edit-red');
    $('#er-active-position').removeClass('er-blink');
    $('.er-skip-status').removeClass('er-red');
    $('.er-skip-status').removeClass('er-blink');
    pushPlaceholder();
    repositionLyrics();
}

// ------------------------------------ Other Edit Modes

$('#er-edit-comments').on('click', function () {
    $('#er-edit-right').addClass('er-edit-blue');
    $('#er-edit-comments').addClass('er-blue');
})

$('#er-edit-wave').on('click', function () {
    $('#er-edit-right').addClass('er-edit-green');
    $('#er-edit-comments').addClass('er-green');
})



// ------------------------------------ Position handling

wavesurfer.on('seek', function () {
    repositionLyrics();
})

// set default skip length
let skipLength = 1000;
$('.er-skip-length').html(skipLength);

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
    $('.er-skip-length').html(skipLength);
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
    $('.er-skip-length').html(skipLength);
})


// skipback skiplength in ms
function skipBack(callback) {
    wavesurfer.skip(-(skipLength / 1000));
    callback();
}

// skipforward skiplength in ms
function skipForward(callback) {
    wavesurfer.skip(skipLength / 1000);
    callback();
}

function skipBackEdit() {
    let position = parseInt($('#er-input-position').val());
    position = position - skipLength;
    console.log(position);
    $('#er-input-position').val(position);
    $('#er-edit-position').html(secondsToString(position / 1000));
    $('#er-active-position').html(secondsToString(position / 1000));
}

function skipForwardEdit() {
    let position = parseInt($('#er-input-position').val());
    position = position + skipLength;
    console.log(position);
    $('#er-input-position').val(position);
    $('#er-edit-position').html(secondsToString(position / 1000));
    $('#er-active-position').html(secondsToString(position / 1000));
}

// go to selected slider position
function gotoPosition(position, callback) {
    wavesurfer.seekTo(position);
    callback();
}



// ------------------------------------ Time handling


// return seconds as MM:SS
function secondsToString(seconds) {
    let totalSec = parseFloat(seconds).toFixed(3);
    let m = Math.floor(totalSec % 3600 / 60);
    let s = Math.floor(totalSec % 3600 % 60);
    let ms = totalSec.slice(-3);
    return ('0' + m).slice(-2) + ':' + ('0' + s).slice(-2) + ':' + ms;
}

// return current position as MM:SS
function currentString() {
    let currentString = secondsToString(wavesurfer.getCurrentTime());
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
function pushPlaceholder() {
    if (editLyric == false) {
        $('#er-line-input').attr('placeholder', 'Click here or hit pause to lick a lyric at ' + currentString());
    }
}

// push the current time to all screen items
function pushCurrentTime() {
    pushPlaceholder();
    $('#er-current-time').html(currentString());
    // $('.er-slider-play').val(getCurrentMs());
}

// ------------------------------------ Control handling

function stopPlaying(callback) {
    wavesurfer.stop();
    editLyric = false;
    callback();
}

// ------------------------------------ Execute when wave is loaded
wavesurfer.on('ready', function () {
    $('#er-wait-screen').removeClass('er-show-block');
    $('#er-wait-ani').addClass('er-hide-block');
    // set height of the lyrics windows
    $('#er-lyrics').css('height', (getTotalMs() / 7) + 'px');
    pushTotalTime();
    jsLyricKeys.forEach(setFadeSpeed);

    // Submit post on submit button
    $('#er-add-line').on('submit', function (event) {
        event.preventDefault();
        console.log("form submitted!") // sanity check
        inputLine();
    });

    // on click display current position as line-edit position in the input 
    $('#er-line-input').on('click', function () {
        if ($('#er-line-input').val() == '' && editLyric == false) {
            lyricAddMode();

        }
    })

    // enable button functions
    $('#er-control-backward').on('click', function () {
        if (editLyric == false) {
            skipBack(repositionLyrics);
        } else {
            skipBackEdit();
        }
    });



    $('#er-control-forward').on('click', function () {
        $('#er-control-backward').addClass('er-control-active');
        $('#er-control-backward').addClass('er-hover-yellow');

        if (editLyric == false) {
            skipForward(repositionLyrics);
        } else {
            skipForwardEdit();
        }
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
        pushPlaceholder();
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