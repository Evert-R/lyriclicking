let editLyric = false; // State of the edit section
let blockDisplay = false;
let activePosition = -1; // Position of active line
let activeLine = ''; // Active lyric line

let deleteMode = false;
let editEndpoint = false;
let editMode = 'none';

// ------------------------------------ Lyrics handling

// This will make the lyrics available in JS
let jsLyrics = JSON.parse(document.getElementById('js-lyrics').textContent);
console.log(jsLyrics);
// Put all the lyric hitpoints in an array for easy sorting and event triggering
let jsLyricKeys = [];
collectLyricKeys(sortLyricKeys);

function collectLyricKeys(callback) {
    for (let key in jsLyrics) {
        jsLyricKeys.push(parseInt(key));
    }
    pushDisplay('Lyrics Collected');
    callback(); // sortLyricsKeys()
}

// callback: sort lyrickeys after change
function sortLyricKeys() {
    jsLyricKeys.sort(function (a, b) {
        return a - b;
    });
    pushDisplay('Lyrics sorted')
    console.log(jsLyricKeys);
    repositionLyrics();
}

function addZero(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

function pushDisplay(message, type) {
    let d = new Date();
    let h = addZero(d.getHours());
    let m = addZero(d.getMinutes());
    let s = addZero(d.getSeconds());
    // $('#er-log').append(`<p>${h}:${m}:${s}- ${message}<P>`)
    if (blockDisplay == false) {
        if (type == 'wait') {
            $('#er-log').html(`${message}`);
            console.log('wait')
        } else {
            $('#er-log').html(`${message}`);
            setTimeout(function () {
                if ($('#er-log').html() == message) {
                    $('#er-log').html(``);
                }
                console.log('logof')
            }, 2000);
            console.log(type)
        }
    }
}




function cancelRequest() {
    initialEditMode();
    pushDisplay('ACTION CANCELLED');
}



$('#er-cancel').on('click', function () {
    cancelRequest();
});


// ------------------------------------ Lyrics Editing


function addLyric(position, endpoint, line, user, date, callback) {
    jsLyrics[position] = {
        'line': line,
        'endpoint': endpoint,
        'user': user,
        'date': date,
    }
    jsLyricKeys.push(position);
    $('#er-lyrics').append(`
    <div class="er-line" style="top:${position / 7}px;" id="er-line-${position}">
    <p>${line}</p>
    </div>                         
    `)
    pushDisplay('key added');
    callback(); // reposition lyrics
}


// Delete a lyric from database
function deleteLyric(position) {

    let postData = {
        'position': position
    }
    let url = '/lyrics/delete/';
    $.post(url, postData).done();
    initialEditMode();
    pushDisplay('LYRIC DELETED');
    removeLyric(position, repositionLyrics); // delete local
}

// delete lyric local
function removeLyric(position, callback) {
    const index = jsLyricKeys.indexOf(parseInt(position));
    jsLyricKeys.splice(index, 1);
    delete jsLyrics[position];
    $('#er-line-' + position).html('');
    callback();
}

// update lyric local
function updateLyric(position, endpoint, line, callback) {
    let match = false;
    jsLyricKeys.forEach(function (item, index) {
        if (position == parseInt(item)) {
            $('#er-line-' + position + '> p').html(line);
            match = true;
            jsLyrics[position].line = line;
            jsLyrics[position].endpoint = endpoint;
            pushDisplay('lyric updated')
        }
    })
    if (match == false) {
        return true;
    }
    callback(); // repositionLyrics
}

// Submit post on submit button
$('#er-lick-lyric').on('submit', function (event) {
    event.preventDefault();
    pushDisplay("New lyric submitted") // sanity check
    lickLyric();
});

// on click display current position as line-edit position in the input 
$('#er-lyric-input').on('click', function () {
    if ($('#er-lyric-input').val() == '' && editMode == 'none') {
        lyricAddMode();
    }
})

// add the line from the input to the database
function OUDlickLyric() {
    let originalPosition = int($('#er-original-position').val());
    let inputPosition = $('#er-input-position').val();
    let inputEndPoint = $('#er-input-endpoint').val();
    let inputLyric = $('#er-lyric-input').val();
    if (originalPosition != -1) {
        removeLyric(originalPosition);
    }

    console.log($('#er-lyric-input').val()) // sanity check
    console.log($('#er-input-position').val()) // sanity check
    $.ajax({
        url: "lyrics/add/", // the endpoint
        type: "POST", // http method
        data: {
            original_position: $('#er-original-position').val(),
            input_line: $('#er-lyric-input').val(),
            input_position: $('#er-input-position').val(),
            input_endpoint: $('#er-input-endpoint').val()
        }, // data sent with the post request

        // handle a successful response
        success: function (json) {
            lyricEditModeOff();

            if (json.prev_position != -1) {
                removeLyric(json.prev_position);
                pushDisplay('Lyric removed');
            }

            if (updateLyric(json.position, json.line, repositionLyrics)) {
                addLyric(json.position, json.line, json.user, json.date, sortLyricKeys);
                pushDisplay('Lyrcic added');
            }
            pushDisplay(`Lyric has been licked`);
        },

        // handle a non-successful response
        error: function (json) {
            initialEditMode();
            console.log(json); // log the returned json to the console
            pushDisplay('ERROR'); // another sanity check
        }
    });
};

// add the line from the input to the database
function lickLyric() {

    let inputPosition = $('#er-input-position').val();
    let inputLyric = $('#er-lyric-input').val();
    let inputEndPoint = $('#er-input-endpoint').val();
    let originalPosition = $('#er-original-position').val();
    if (originalPosition == '-1') {
        addLyric(inputPosition, inputEndPoint, inputLyric, '', '', sortLyricKeys);
    } else if (originalPosition == inputPosition) {
        updateLyric(inputPosition, inputEndPoint, inputLyric, repositionLyrics);
    } else {
        removeLyric(originalPosition, repositionLyrics);
        addLyric(inputPosition, inputEndPoint, inputLyric, '', '', sortLyricKeys);
    }

    let url = '/lyrics/lick/';
    let postData = {
        'original_position': originalPosition,
        'input_lyric': inputLyric,
        'input_position': inputPosition,
        'input_endpoint': inputEndPoint
    }
    $.post(url, postData).done(function () {
        initialEditMode();
        pushDisplay('LYRIC LICKED');
    })
};



// set fadespeed to duration time till the next line
function setFadeSpeed(position, index) {
    let fadeTime
    if (position != jsLyrics[position].endpoint) {
        fadeTime = (jsLyrics[position].endpoint - position)
    } else {
        fadeTime = (jsLyricKeys[index + 1]) - position;
    }
    $('#er-line-' + position).css('transition-duration', (fadeTime / 1000) + 's');
}

function updateFadeSpeed(position) {
    let fadeTime = (jsLyrics[position].endpoint - position);
    $('#er-line-' + position).css('transition-duration', (fadeTime / 1000) + 's');
}

// callback: set current position of lyrics after skip or slide
function repositionLyrics() {
    $('#er-lyrics').css('top', '-' + (getCurrentMs() / 7) + 'px');

    $('.er-line').removeClass('er-line-in er-line-out');
    jsLyricKeys.forEach(getCurrentLinePosition);
    pushCurrentTime();
}

function ggggetCurrentLinePosition(position, index) {

    if (getCurrentMs() >= position && position != activePosition) { // verder dan start pos en niet actief
        if (getCurrentMs() < jsLyricKeys[index + 1] || // nog voor volgende start pos of
            getCurrentMs() < jsLyrics[position].endpoint || // nog voor het eindpunt van huidige of
            index == jsLyricKeys.length - 1) { // als dit de laatste lyric is
            pushCurrentLine(position, index);
        }
    } else if (getCurrentMs() > jsLyricKeys[index + 1] && position != activePosition) { // verder dan volgende pos 
        setNoCurrentLine();
    } //else if (getCurrentMs() >= position && getCurrentMs() > jsLyrics[position].endpoint && position == activePosition) {
    // setNoCurrentLine();
    //pushEndPointStatus('passed');
    //console.log('endpoint');
    // }
}

function getCurrentLinePosition(position, index) {
    let currentPos = getCurrentMs();
    if (currentPos >= position && position != activePosition) { // verder dan start pos en niet actief
        if (currentPos < jsLyricKeys[index + 1] || // nog voor volgende start pos of
            (position != jsLyrics[position].endpoint && currentPos < jsLyrics[position].endpoint) ||
            index == jsLyricKeys.length - 1) {// nog voor het eindpunt van huidige of
            pushCurrentLine(position, index);
        }
    } else if (currentPos >= position && position == activePosition && activeLine != '') {
        if (position != jsLyrics[position].endpoint && currentPos >= jsLyrics[position].endpoint) {// nog voor het eindpunt van huidige of
            setNoCurrentLine();
        }
    }
}

function setNoCurrentLine() {
    console.log('noCurrentLine');
    activeLine = '';
    pushPositionLabel('CURRENT PLAY POSITION');
    $('#er-current-line').html('');
    if (editMode == 'none') {
        $('#er-active-position').removeClass('er-red');
        $('#er-edit-current').removeClass('er-control-active');
        $('#er-edit-current').removeClass('er-hover-yellow');
        $('#er-delete-current').removeClass('er-control-active');
        $('#er-delete-current').removeClass('er-hover-red');
        $('#er-endpoint-status').removeClass('er-control-yellow');
        $('#er-endpoint-status').removeClass('er-control-active');
        pushEndPointStatus('unset');
    }
}

function pushCurrentLine(position, index) {
    console.log('pushCurrentLine');
    activePosition = position;
    activeLine = jsLyrics[position].line;

    $('#er-line-' + jsLyricKeys[index + 1]).addClass('er-line-in');
    $('#er-line-' + position).addClass('er-line-out');
    pushActivePosition(position);
    pushPositionLabel('ACTIVE LYRIC POSITION');
    $('#er-current-line').html(jsLyrics[position].line);
    $('#er-active-line').html(jsLyrics[position].line);
    $('#er-edit-current').addClass('er-control-active');
    $('#er-edit-current').addClass('er-hover-yellow');
    $('#er-delete-current').addClass('er-control-active');
    $('#er-delete-current').addClass('er-hover-red');
    if (position != jsLyrics[position].endpoint) {
        pushEndPointStatus('set');
    } else {
        pushEndPointStatus('unset')
    }
    if (index == 0) {
        $('#er-control-previous').removeClass('er-control-active');
        $('#er-control-previous').removeClass('er-hover-yellow');
    }
    if (index > 0) {
        $('#er-control-previous').addClass('er-control-active');
        $('#er-control-previous').addClass('er-hover-yellow');
    }
    if (index == jsLyricKeys.length - 1) {
        $('#er-control-next').removeClass('er-control-active');
        $('#er-control-next').removeClass('er-hover-yellow');
    }
    if (index < jsLyricKeys.length - 1) {
        $('#er-control-next').addClass('er-control-active');
        $('#er-control-next').addClass('er-hover-yellow');
    }
}

function pushActivePosition(position) {
    console.log(position);
    if (editMode == 'none' && blockDisplay == false) {

        $('#er-active-position').html(secondsToString(position / 1000));
        $('.er-position-display').removeClass('er-dark');
        $('.er-position-display').addClass('er-red');
    }
}

// ------------------------------------ Edit modes



// ------------------------------------ Bind Edit events

$('#er-edit-current').on('click', function () {
    position = activePosition;
    if (editMode == 'lyric' || editMode == 'lick' || editMode == 'lickEnpoint' || editMode == 'lyricEndpoint') {
        initialEditMode();
        repositionLyrics();
    } else if (editMode == 'delete') {
        initialEditMode();
        lyricEditMode($('#er-input-position').val());
    } else if (editMode == 'lick') {
        initialEditMode();
        repositionLyrics();
    } else if (activeLine != '' && editMode == 'none') {
        lyricEditMode(position);
    } else {
        pushDisplay('NOTHING TO EDIT');
    }
})

$('#er-delete-current').on('click', function () {
    position = activePosition;
    if (editMode == 'delete') {
        initialEditMode();
        repositionLyrics();
    } else if (editMode == 'lyric') {
        initialEditMode();
        deleteRequest($('#er-input-position').val());
    } else if (activeLine != '' && editMode == 'none') {
        deleteRequest(position);
    } else {
        pushDisplay('NOTHING TO EDIT');
    }
})

$('#er-cancel-input').on('click', function () {
    lyricEditModeOff();
})


// ------------------------------------ Push Edit modes

function initialEditMode() {
    setEditMode('none');

    $('.er-edit-wrap').removeClass('er-edit-yellow');
    $('.er-edit-wrap').removeClass('er-edit-red');

    // Edit Lyric button
    $('#er-edit-current').removeClass('er-control-yellow');
    $('#er-edit-current').removeClass('er-hover-dark');
    $('#er-edit-current').removeClass('er-hover-yellow');
    $('#er-edit-current').removeClass('er-control-active');

    $('#er-delete-current').removeClass('er-control-red');
    $('#er-delete-current').removeClass('er-hover-dark');
    $('#er-delete-current').removeClass('er-hover-red');
    $('#er-delete-current').removeClass('er-control-active');

    // EditMode Display
    blockDisplay = false;
    pushDisplay('');
    $('#er-display-wrap').removeClass('er-edit-red');
    $('#er-display-wrap').removeClass('er-edit-yellow');
    $('#er-lick').addClass('er-control-hide');
    $('#er-confirm').addClass('er-control-hide');
    $('#er-cancel').addClass('er-control-hide');

    // Main Display
    pushPositionLabel('ACTIVE LYRIC POSITION');
    $('#er-active-position').removeClass('er-blink');
    $('#er-endpoint-status').removeClass('er-hover-red');
    $('#er-endpoint-status').removeClass('er-hover-dark');
    $('#er-endpoint-status').removeClass('er-hover-yellow');
    $('#er-endpoint-status').removeClass('er-control-red');
    $('#er-endpoint-status').removeClass('er-control-yellow');
    $('#er-endpoint-status').removeClass('er-blink');
    $('#er-endpoint-status').removeClass('er-control-active');

    // Lyric Input Field
    $('.er-input-row').removeClass('er-active-button');
    $('.er-input-row').removeClass('er-input-red');
    $('.er-input-row').removeClass('er-input-yellow');
    $('#er-lyric-input').val('');

    // Controls
    $('.er-skip-status').removeClass('er-red');
    $('.er-skip-status').removeClass('er-blink');
    repositionLyrics();
}

function lyricAddMode() {
    let position = getCurrentMs();
    setEditMode('lick');

    // Push Edit data
    $('#er-input-position').val(position); // set position of new lyric
    $('#er-original-position').val('-1');
    $('#er-input-endpoint').val(position); // set endpoint of new lyric  

    $('.er-edit-wrap').addClass('er-edit-yellow');

    $('#er-edit-current').addClass('er-control-yellow');
    $('#er-edit-current').addClass('er-hover-dark');

    // EditMode Display    

    $('#er-display-wrap').addClass('er-edit-yellow');
    $('#er-lick').removeClass('er-control-hide');
    $('#er-cancel').removeClass('er-control-hide');
    pushDisplay('LICK A LYRIC', 'wait');
    blockDisplay = true;

    // Main Display
    pushPositionLabel('LICK LYRIC AT POSITION');
    $('#er-active-position').addClass('er-blink'); // blink big display
    $('#er-endpoint-status').removeClass('er-hover-dark');
    $('#er-endpoint-status').addClass('er-hover-red');
    $('#er-active-position').html(secondsToString(position / 1000)); // current position to big display

    // Lyric Input Field
    $('.er-input-row').addClass('er-active-button'); // show lick lyric button in input
    $('.er-input-row').addClass('er-input-yellow');
    $('#er-lyric-input').attr('placeholder', ''); // remove placeholder from input  

    // Controls
    $('.er-skip-status').addClass('er-red'); // skip status red
    $('.er-skip-status').addClass('er-blink'); // skip status blink    
}



function lyricEditMode(position) {
    let editLine = jsLyrics[position].line
    setEditMode('lyric');

    // Push Edit data
    $('#er-lyric-input').val(editLine);
    $('#er-edit-position').html(secondsToString(position / 1000));
    $('#er-input-position').val(position);
    $('#er-original-position').val(position);

    // Determine and push endpoint
    $('#er-input-endpoint').val(jsLyrics[position].endpoint);
    let endpoint = secondsToString(jsLyrics[position].endpoint / 1000);
    $('#er-right-endpoint').html(` - ${endpoint}`);
    if (jsLyrics[position].endpoint != position) {
        $('#er-endpoint-status').addClass('er-control-yellow');
    } else {
        $('#er-endpoint-status').addClass('er-control-active');
    }

    $('.er-edit-wrap').addClass('er-edit-yellow');

    // Edit Lyric button    
    $('#er-edit-current').addClass('er-control-yellow');
    $('#er-edit-current').removeClass('er-hover-yellow');
    $('#er-edit-current').addClass('er-hover-dark');


    // Delete Lyric button
    $('#er-delete-current').addClass('er-hover-red');
    $('#er-delete-current').addClass('er-control-active');

    // EditMode Display
    $('#er-display-wrap').addClass('er-edit-yellow');
    $('#er-lick').removeClass('er-control-hide');
    $('#er-cancel').removeClass('er-control-hide');
    pushDisplay('EDIT LYRIC');


    // Main Display
    pushPositionLabel('EDIT LYRIC AT POSITION');

    $('#er-active-position').addClass('er-blink');
    $('#er-endpoint-status').removeClass('er-hover-dark');
    $('#er-endpoint-status').addClass('er-hover-red');


    // Lyric Input Field
    $('.er-input-row').addClass('er-active-button');

    $('.er-input-row').addClass('er-input-yellow');
    $('#er-lyric-input').attr('placeholder', '');


    // Controls
    $('.er-skip-status').addClass('er-red');
    $('.er-skip-status').addClass('er-blink');
}
function deleteRequest(position) {

    setEditMode('delete');
    // Push Edit data
    $('#er-lyric-input').val(jsLyrics[position].line);
    $('#er-input-position').val(position);
    $('#er-confirm').on('click', function () {
        deleteLyric(position);
    });

    $('.er-edit-wrap').addClass('er-edit-red');

    // Edit Lyric button        
    $('#er-edit-current').addClass('er-hover-yellow');
    $('#er-edit-current').addClass('er-control-active');

    // Delete Lyric button
    $('#er-delete-current').removeClass('er-hover-red');
    $('#er-delete-current').addClass('er-control-red');
    $('#er-delete-current').addClass('er-hover-dark');

    // EditMode Display
    confirmModeOn('DELETE THIS LYRIC ?');

    // Main Display
    pushPositionLabel('DELETE LYRIC AT POSITION');
    $('#er-active-position').html(secondsToString(position / 1000));
    $('#er-active-position').addClass('er-blink');

    // Lyric Input Field
    $('.er-input-row').addClass('er-input-red');
}

function endPointEditMode() {
    if (editMode == 'lick') {
        editMode = 'lickEndpoint';
        pushLog('Edit mode: Lick endpoint');
    } else if (editMode == 'lyric') {
        editMode = 'lyricEndpoint';
        pushLog('Edit mode: Edit endpoint');
    }
    let endpoint = parseInt($('#er-input-endpoint').val())
    $('#er-active-position').html(secondsToString(endpoint / 1000));
    $('#er-endpoint-status').removeClass('er-control-yellow');
    $('#er-endpoint-status').addClass('er-control-red');
    $('#er-endpoint-status').addClass('er-blink');
    pushPositionLabel('SET ENDPOINT AT POSITION');
}

function endPointEditModeOff() {
    if (editMode == 'lickEndpoint') {
        editMode = 'lick';
        pushPositionLabel('LICK LYRIC AT POSITION');
    } else if (editMode == 'lyricEndpoint') {
        editMode = 'lyric';
        pushPositionLabel('EDIT LYRIC AT POSITION');
    }
    $('#er-endpoint-status').removeClass('er-control-red');
    $('#er-endpoint-status').removeClass('er-blink');
    $('#er-endpoint-status').addClass('er-control-yellow');
    $('#er-endpoint-status').addClass('er-hover-dark');
    let position = parseInt($('#er-input-position').val());
    $('#er-active-position').html(secondsToString(position / 1000));
}



function confirmModeOn(choice) {
    pushDisplay(choice, 'wait');
    blockDisplay = true;
    $('#er-display-wrap').addClass('er-edit-red');
    $('#er-confirm').removeClass('er-control-hide');
    $('#er-cancel').removeClass('er-control-hide');
}


function pushPositionLabel(label) {
    $('#er-position-label').html(label)
}

function pushLog(message) {
    $('#er-system-log').append(`<p>${message}</p>`);
}

function setEditMode(mode) {
    editMode = mode;
    pushLog(`Edit mode: ${editMode}`);
}

function lyricEditModeOff() {
    editMode = 'none';
    $('#er-edit-current').removeClass('er-control-yellow');
    $('.er-input-row').removeClass('er-active-button');
    $('#er-lyric-input').val('');
    // $('#er-edit-position').html('');
    $('#er-original-position').val('-1');
    $('#er-edit-current').removeClass('er-control-yellow');
    $('#er-edit-current').removeClass('er-hover-dark');
    // $('.er-input-helpers').addClass('er-hide');
    $('#er-cancel').addClass('er-control-hide');
    $('#er-lick').addClass('er-control-hide');
    // $('#er-edit-right').removeClass('er-edit-red');
    $('#er-active-position').removeClass('er-blink');
    $('.er-skip-status').removeClass('er-red');
    $('.er-skip-status').removeClass('er-blink');
    $('#er-endpoint-status').removeClass('er-hover-red');
    pushPlaceholder();
    repositionLyrics();
    pushPositionLabel('ACTIVE LYRIC POSITION');
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
    console.log(getCurrentMs());
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


function skipPrevious() {
    let currentPos;
    if (editMode == 'lyric' || editMode == 'delete') {
        currentPos = $('#er-input-position').val();
    } else {
        currentPos = activePosition;
    }
    jsLyricKeys.forEach(function (item, index) {

        if (item == currentPos && index > 0) {
            let previous = jsLyricKeys[index - 1];
            if (editMode == 'lyric') {
                initialEditMode();
                $('#er-active-position').html(secondsToString(previous / 1000));
                if (wavesurfer.isPlaying() == false) {
                    $('#er-current-line').html(jsLyrics[previous].line);
                }
                lyricEditMode(previous);
            } else if (editMode == 'delete') {
                initialEditMode();
                $('#er-active-position').html(secondsToString(previous / 1000));
                if (wavesurfer.isPlaying() == false) {
                    $('#er-current-line').html(jsLyrics[previous].line);
                }
                deleteRequest(previous);
            } else if (editMode == 'none') {
                gotoPosition(previous, index - 1);
            }
        } else if (item == currentPos && index == 0) {
            pushDisplay('FIRST LYRIC REACHED');
        }
    })
}

function skipNext() {
    let currentPos;
    if (editMode == 'lyric' || editMode == 'delete') {
        currentPos = $('#er-input-position').val();
    } else {
        currentPos = activePosition;
    }
    jsLyricKeys.forEach(function (item, index) {
        if (item == currentPos && index != jsLyricKeys.length - 1) {
            let next = jsLyricKeys[index + 1];
            if (editMode == 'lyric') {
                initialEditMode();
                $('#er-active-position').html(secondsToString(next / 1000));
                if (wavesurfer.isPlaying() == false) {
                    $('#er-current-line').html(jsLyrics[next].line);
                }
                lyricEditMode(next);
            } else if (editMode == 'delete') {
                currentPos = $('#er-input-position').val();
                initialEditMode();
                $('#er-active-position').html(secondsToString(next / 1000));
                if (wavesurfer.isPlaying() == false) {
                    $('#er-current-line').html(jsLyrics[next].line);
                }
                deleteRequest(next);
            } else if (editMode == 'none') {
                gotoPosition(next, index + 1);
            }
        }
    })
}

// skipback skiplength in ms
function skipBack(callback) {
    wavesurfer.skip(-(skipLength / 1000));
    pushDisplay('SKIP BACK ' + skipLength + ' ms');
    callback();
}

// skipforward skiplength in ms
function skipForward(callback) {
    wavesurfer.skip(skipLength / 1000);
    pushDisplay('SKIP FORWARD ' + skipLength + ' ms');
    callback();
}

function skipBackEdit() {
    if (editMode == 'lyricEndpoint' || editMode == 'lickEndpoint') {
        let position = parseInt($('#er-input-position').val());
        let endPoint = parseInt($('#er-input-endpoint').val());
        endPoint = endPoint - skipLength;
        if (endPoint <= position) {
            endPoint = position + 1;
            $('#er-input-endpoint').val(endPoint);
            $('#er-active-position').html(secondsToString(endPoint / 1000));
            pushDisplay('START POSITION REACHED');
        } else {
            $('#er-input-endpoint').val(endPoint);
            $('#er-active-position').html(secondsToString(endPoint / 1000));
            pushDisplay('END OF VERSE SET AT ' + secondsToString(endPoint / 1000));
        }
    } else {
        let position = parseInt($('#er-input-position').val());
        position = position - skipLength;
        $('#er-input-position').val(position);
        $('#er-edit-position').html(secondsToString(position / 1000));
        $('#er-active-position').html(secondsToString(position / 1000));
        pushDisplay('LYRIC START ' + secondsToString(position / 1000));
    }
}

function skipForwardEdit(mode) {
    let nextPos;
    if (editMode == 'lyricEndpoint' || editMode == 'lickEndpoint') {
        let position = parseInt($('#er-input-position').val());
        let endPoint = parseInt($('#er-input-endpoint').val());
        jsLyricKeys.forEach(function (item, index) {
            if (item == position) {
                nextPos = jsLyricKeys[index + 1];
            }
        })
        endPoint = endPoint + skipLength;
        if (endPoint >= nextPos) {
            endPoint = nextPos - 1;
            $('#er-input-endpoint').val(endPoint);
            $('#er-active-position').html(secondsToString(endPoint / 1000));
            pushDisplay('NEXT LYRIC REACHED');
        } else {
            $('#er-input-endpoint').val(endPoint);
            $('#er-active-position').html(secondsToString(endPoint / 1000));
            pushDisplay('END OF VERSE SET AT ' + secondsToString(endPoint / 1000));
        }

    } else {
        let position = parseInt($('#er-input-position').val());
        position = position + skipLength;
        pushDisplay(`Skipped to ${position}`);
        $('#er-input-position').val(position);
        $('#er-edit-position').html(secondsToString(position / 1000));
        $('#er-active-position').html(secondsToString(position / 1000));
        pushDisplay('LYRIC START ' + secondsToString(position / 1000));
    }
}



// go to selected slider position
function gotoPosition(position, index) {
    let range = (1 / getTotalMs());
    let newPosition = (range * position);
    console.log(range);
    console.log(newPosition);
    wavesurfer.seekTo(newPosition);
    pushCurrentLine(position, index);
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
    if (editMode == 'none') {
        $('#er-lyric-input').attr('placeholder', 'Click here or hit pause to lick a lyric at ' + currentString());
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
    editMode = 'none';
    callback();
}

function flashSkipButton(id) {
    console.log(id);
    $(id).addClass('er-control-purple');
    $(id).addClass('er-blink');
    setTimeout(function () {
        $(id).removeClass('er-control-purple');
        $(id).removeClass('er-blink');
    }, 300);
}

function flashNextPrevButton(id) {
    console.log(id);
    $(id).addClass('er-control-yellow');
    $(id).addClass('er-blink');
    setTimeout(function () {
        $(id).removeClass('er-control-yellow');
        $(id).removeClass('er-blink');
    }, 150);
}

// ------------------------------------ Execute when wave is loaded
wavesurfer.on('ready', function () {
    $('#er-wait-screen').removeClass('er-show-block');
    $('#er-wait-ani').addClass('er-hide-block');
    // set height of the lyrics windows
    $('#er-lyrics').css('height', (getTotalMs() / 7) + 'px');
    pushTotalTime();
    jsLyricKeys.forEach(setFadeSpeed);



    // enable button functions
    $('#er-control-backward').on('click', function () {
        flashSkipButton('#er-control-backward');
        if (editMode == 'none') {
            skipBack(repositionLyrics);
        } else {
            skipBackEdit();
        }
    });

    $('#er-control-previous').on('click', function () {
        flashNextPrevButton('#er-control-previous');
        skipPrevious();
    });

    $('#er-control-next').on('click', function () {
        flashNextPrevButton('#er-control-next');
        skipNext();
    });


    $('#er-control-forward').on('click', function () {
        $('#er-control-backward').addClass('er-control-active');
        $('#er-control-backward').addClass('er-hover-purple');
        flashSkipButton('#er-control-forward');
        if (editMode == 'none') {
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
    pushInitialMode();


    // activate stop, backwards, hide play, show pause
    $('#er-control-play').on('click', function () {
        pushPlayMode();
        wavesurfer.play();

    });

    $('#er-control-pause').on('click', function () {

        pushPauseMode();
        wavesurfer.pause();
    });

    // show play, rewind track
    $('#er-control-stop').on('click', function () {
        initialEditMode();
        pushStopMode();
        pushDisplay('STOPPED');
        stopPlaying(repositionLyrics);
    });

    $('#er-endpoint-status').on('click', function () {
        if (editMode == 'none') {
            if (activePosition != jsLyrics[activePosition].endpoint) {
                pushEndPointStatus('unset')
                postEndPoint(activePosition, getCurrentMs(), 'unset', repositionLyrics);
            } else {
                pushEndPointStatus('set')
                postEndPoint(activePosition, getCurrentMs(), 'set', repositionLyrics);
            }
        } else if (editMode == 'lyric' || editMode == 'lick') {
            endPointEditMode();
        } else {
            endPointEditModeOff();
        }
    })




    $('#er-set-endpoint').on('click', function () {
        postEndPoint(activePosition, getCurrentMs(), 'set', repositionLyrics)
        $('#er-endpoint-status').addClass('er-control-yellow');
        $('#er-endpoint-status').addClass('er-hover-dark');
    })
    $('#er-unset-endpoint').on('click', function () {
        postEndPoint(activePosition, getCurrentMs(), 'unset', repositionLyrics)
        $('#er-endpoint-status').removeClass('er-control-yellow');
    })
});

function pushEndPointStatus(status) {
    if (editMode == 'none') {
        if (status == 'set') {
            $('#er-endpoint-status').addClass('er-control-yellow');
            $('#er-endpoint-status').addClass('er-hover-dark');
            $('#er-endpoint-status').removeClass('er-hover-yellow');

        } else if (status == 'unset') {
            $('#er-endpoint-status').removeClass('er-control-yellow');
            $('#er-endpoint-status').addClass('er-hover-yellow');
            $('#er-endpoint-status').removeClass('er-control-active');
            $('#er-endpoint-status').removeClass('er-hover-dark');

        } else if (status == 'passed') {
            $('#er-endpoint-status').addClass('er-hover-yellow');
            $('#er-endpoint-status').removeClass('er-control-active');
            $('#er-endpoint-status').removeClass('er-hover-dark');

        }
    }
}

function postEndPoint(position, endpoint, action, callback) {
    let postData = {
        'position': position,
        'endpoint': endpoint,
        'action': action
    }
    let url = '/lyrics/setendpoint/';
    if (action == 'set') {
        jsLyrics[position].endpoint = endpoint;
        initialEditMode();
        pushEndPointStatus('set');
        pushDisplay(`endpoint set at: ${jsLyrics[position].endpoint}`);
    } else {
        jsLyrics[position].endpoint = position;
        initialEditMode();
        pushEndPointStatus('unset');
        pushDisplay('endpoint deleted')
    }
    $.post(url, postData).done(function () {
        callback();
    });
}

function pushInitialMode() {
    pushPositionLabel('CURRENT PLAY POSITION');
    $('.er-position-display').addClass('er-active');

    $('#er-control-play').removeClass('er-control-hide');
    $('#er-control-play').addClass('er-control-active');
    $('#er-control-play').addClass('er-hover-green');
    $('#er-control-play').removeClass('er-control-green');
    $('#er-control-play').removeClass('er-control-blink');

    $('#er-control-pause').addClass('er-control-hide');

    $('#er-control-stop').addClass('er-control-blue');

    $('#er-control-backward').removeClass('er-control-active');
    $('#er-control-backward').removeClass('er-hover-purple');
    $('#er-control-forward').addClass('er-control-active');
    $('#er-control-forward').addClass('er-hover-purple');

    $('#er-control-previous').removeClass('er-control-active');
    $('#er-control-previous').removeClass('er-hover-yellow');

    $('#er-control-next').addClass('er-control-active');
    $('#er-control-next').addClass('er-hover-yellow');


    $('#er-control-stop').addClass('er-control-blue');
}

function pushPlayMode() {
    $('#er-lyric-input').val('');
    $('#er-control-play').addClass('er-control-hide');
    $('#er-control-pause').removeClass('er-control-hide');
    $('#er-control-pause').addClass('er-control-green');
    $('#er-control-pause').addClass('er-hover-dark');

    $('#er-control-backward').addClass('er-control-active');
    $('#er-control-backward').addClass('er-hover-purple');

    $('#er-endpoint-status').addClass('er-hover-red');
    $('#er-control-stop').addClass('er-control-active');
    $('#er-control-stop').addClass('er-hover-blue');
    $('#er-control-stop').removeClass('er-control-blue');

    $('#er-control-play').removeClass('er-control-blink');
    pushDisplay('PLAYING');
}
function pushPauseMode() {
    $('#er-control-play').removeClass('er-control-hide');
    $('#er-control-play').addClass('er-control-blink');
    $('#er-control-play').addClass('er-control-green');
    $('#er-control-play').addClass('er-hover-dark');
    $('#er-control-pause').addClass('er-control-hide');
    pushDisplay('PAUSED');
}

function pushStopMode() {
    pushInitialMode();
    $('#er-current-line').html('');
    $('#er-active-position').html('00:00:000');
}

// ------------------------------------ Execute while playing
wavesurfer.on('audioprocess', function () {
    if (wavesurfer.isPlaying()) {
        // 
        $('#er-current-time').html(currentString());
        pushPlaceholder();
        $('#er-lyrics').css('top', '-' + (getCurrentMs() / 7) + 'px');
        if (activeLine == '') {
            $('#er-active-position').html(currentString());
        }
        setTimeout(function () {
            jsLyricKeys.forEach(getCurrentLinePosition)
        }, 5);
    }
});

