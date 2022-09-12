// const textPresetVal = new Choices('#search_value', {removeItemButton: true,});


const apiURL = './api/v1/generate_collage?username=[USERNAME]';

/**
 * Short for console log
 */
function l(t) {
    if (typeof t === 'string') {
        console.log('[L] ' + t);
    } else {
        console.log(t);
    }
}


/**
 * Change screen
 */

function changeToScreen(newScreen, removeInline, extraClass) {
    $('.section').hide();
    $(newScreen).show();
    if (removeInline) {
        $(newScreen).attr('style', '');
        $(newScreen).addClass(extraClass);
    }

}


/**
 * Start the search use process
 */
function searchUser() {
    l('Start search user process');
    changeToScreen('#loadingScreen', true, 'open');
    const username = getUsernameValue();
    const builtURL = apiURL.replace('[USERNAME]', username);
    l('Using the URL: ');
    l(builtURL);
    $.get(builtURL, (data) => {

    }, "json").done((data) => {
        l('Load executed');
        l(data);
        $('#resulting_image').attr('src',data.data.code[0].dataUrl);
        changeToScreen('#result_image',true,'open');
    }).fail((data) => {
        l('Error in the information');
        l(data.responseJSON);
        changeToScreen('#result_error',true,'open');
    });
}

/**
 * Bind changes/effect
 */
function bindChanges() {
    $('#search_value').keyup(() => {
        const username = getUsernameValue();
        l('Changing log for: ' + username);

        if (typeof username === 'undefined' || username === '' || username === null || username.length === 0) {
            $('#goButton').hide();
            return;
        }
        $('#goButton').show();
    });

    $('#subForm').submit((e) => {
        e.preventDefault();
        l('Form Submits');
        const username = getUsernameValue();
        if (typeof username === 'undefined' || username === '' || username === null) {
            return;
        }
        searchUser();
    });
}


/**
 * Returns the Username value
 */
function getUsernameValue() {
    return $('#search_value').val().trim()
}

/**
 * Bind buttons
 */
function bindButtons() {
    $('#goButton').click(() => {
        const username = getUsernameValue();
        if (typeof username === 'undefined' || username === '' || username === null) {
            return;
        }
        l('Searching for: ' + username);
        searchUser();
    });
}

$(window).ready(() => {
    bindChanges();
    bindButtons();

});