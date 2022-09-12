/**
 * Entry file
 * =====================================
 * This file will display the main page and will
 * also take care of the API call to get the user information
 */


/**
 * The express Library and configuration
 */

const express = require('express');
const app = express();
const port = 80; // We can change this port


/**
 * Other libraries
 */
const Console = require('./utilities/Console');



/**
 * First we set up the static folder
 */
app.use(express.static('public'));
app.use(express.static('result'));


/**
 * Routes for API calls
 * ======================================================
 */

const apiPrefix = '/api/v1/'; // This prefix will be applied to all API routes

/**
 * The main endpoint to generate the collage
 */
app.get(apiPrefix + 'generate_collage', async (req, res) => {
    const ApiResponseClass = require('./classes/APIResponse');
    const response = new ApiResponseClass.APIResponse();
    const username = req.query.username;

    if( typeof username !== 'undefined' && username !== '' && username !== null ){

        /*
            Preparing the BGG Libraries
         */
        const BGGCanvasClass = require('./classes/BGGCanvas');
        const config = require('./config.json');

        config.username = username;
        const BGG =  new BGGCanvasClass.BGGCanvas(config);
        const url = await BGG.getCollection(false);

        if( url === false ){
            response.setError('Could not get any information for the given user');
        }else{
            response.setResponse({username: username, code: url});
        }


    }else{
        response.setError('Username missing');
    }

    // res.send('Received');
    res.status(response.code).json(response.getResponseJSON());
});



app.listen(port, () => {
    Console.log(`App Listing to port ${port}`)
})