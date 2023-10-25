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
const _ = require('lodash');
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

    if (typeof username !== 'undefined' && username !== '' && username !== null) {

        /*
            Preparing the BGG Libraries
         */
        const BGGCanvasClass = require('./classes/BGGCanvas');
        const config = require('./config.json');

        config.username = username;
        const BGG = new BGGCanvasClass.BGGCanvas(config);
        const url = await BGG.getCollection(false);

        if (url === false) {
            response.setError('Could not get any information for the given user');
        } else {
            response.setResponse({username: username, code: url});
        }


    } else {
        response.setError('Username missing');
    }

    // res.send('Received');
    res.status(response.code).json(response.getResponseJSON());
});


app.get(apiPrefix + 'get_collection', async (req, res) => {
    const ApiResponseClass = require('./classes/APIResponse');
    const response = new ApiResponseClass.APIResponse();
    const username = req.query.username;

    console.log('Username', username);


    if (typeof username !== 'undefined' && username !== '' && username !== null) {
        const users = username.split('|');
        console.log('Users', users);
        let totalGames = {};

        totalGames.collections = {};
        totalGames.users = users;
        totalGames.totalCollection = [];

        for (let i = 0; i < users.length; i++) {
            const singleUser = users[i];
            console.log('Getting single user', singleUser);


            console.log('Getting collection information');
            /**
             * Client got from https://www.npmjs.com/package/bgg-xml-api-client
             */
            const bggClient = require('bgg-xml-api-client');

            const filter = {
                "own": 1,
                "username": singleUser,
                "subtype": "boardgame",
                "excludesubtype":"boardgameexpansion"
            };
            const results = await bggClient.getBggCollection(filter);
            console.log('Results for: ' + singleUser, results.data);
            totalGames.collections[singleUser] = results.data.item;
            totalGames.totalCollection = totalGames.totalCollection.concat(results.data.item);
            totalGames.totalCollectionUnique = _.sortBy(_.uniqBy(totalGames.totalCollection,'objectid'),['objectid']);
        }

        res.status(200).json(totalGames);
    } else {
        response.setError('Username missing');
    }

    // res.send('Received');
});

app.get(apiPrefix + 'get_collection2', async (req, res) => {
    const ApiResponseClass = require('./classes/APIResponse');
    const response = new ApiResponseClass.APIResponse();
    const username = req.query.username;

    if (typeof username !== 'undefined' && username !== '' && username !== null) {

        /*
            Preparing the BGG Libraries
         */
        const BGGCanvasClass = require('./classes/BGGCanvas');
        const config = require('./config.json');


        const users = username.split('|');

        const totalGames = [];

        for (let i = 0; i < users.length; i++) {
            const singleUser = users[i];
        }

        /*
                config.username = username;
                const BGG =  new BGGCanvasClass.BGGCanvas(config);
                const url = await BGG.getCollection(false);

                if( url === false ){
                    response.setError('Could not get any information for the given user');
                }else{
                    response.setResponse({username: username, code: url});
                }
        */

    } else {
        response.setError('Username missing');
    }

    // res.send('Received');

    res.status(response.code).json(response.getResponseJSON());
});


app.listen(port, () => {
    Console.log(`App Listing to port ${port}`)
})