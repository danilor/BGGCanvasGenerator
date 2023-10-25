// const textPresetVal = new Choices('#search_value', {removeItemButton: true,});


const apiURL = './api/v1/get_collection?username=[USERNAME]';

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
        $('#resulting_image').attr('src', data.data.code[0].dataUrl);
        $('#download_image').attr('href', data.data.code[0].dataUrl);


        changeToScreen('#result_image', true, 'open');
    }).fail((data) => {
        l('Error in the information');
        l(data.responseJSON);
        changeToScreen('#result_error', true, 'open');
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

        if (typeof username === 'undefined' || username === '' || username === null) {
            return;
        }
        l('Searching for: ' + username);
        searchUser();
    });
}

function get_collection() {
    l('Start search user process');
    changeToScreen('#loadingScreen', true, 'open');

    const username = "arkofdan|crisguso93|ExtraBills95|Furankokun|LaSeguaGames|Mmolinam|Kaladin_";
    const builtURL = apiURL.replace('[USERNAME]', username);
    l('Using the URL: ');
    l(builtURL);
    $.get(builtURL, (data) => {

    }, "json").done((data) => {
        l('Load executed');
        l(data);
        const unique = data.totalCollectionUnique;

        for (let i = 0; i < unique.length; i++) {
            const image = unique[i];

            if (typeof image !== 'undefined' && image !== null && typeof image !== 'undefined') {
                // console.log(image.image);
                const image_tag = `
                <a target="_blank" href="https://boardgamegeek.com/boardgame/${image.objectid}">
                    <img src="${image.thumbnail}" class="single_game" loading="lazy" date.type="${image.subtype}" />
                </a>
                `;
                $("#games_space").append(image_tag);
            }

        }

        changeToScreen('#mainForm', false, 'open');
        $("#mainForm").show();
        // $('#resulting_image').attr('src', data.data.code[0].dataUrl);
        // $('#download_image').attr('href', data.data.code[0].dataUrl);

    }).fail((data) => {
        l('Error in the information');
        l(data.responseJSON);
        // changeToScreen('#result_error', true, 'open');
    });

}


$(window).ready(() => {
    // bindChanges();
    // bindButtons();
    get_collection();
});
