/**
 * Created by Danilo Ramírez Mattey
 * Quite an experiment. Only for experiment purposes.
 *
 * The idea behind this little script is to read the collections from an user on BGG
 * and create somekind of collage.
 *
 * I am planning to use temporall folders to store the images, but we will see how it goes
 *
 * @author Danilo Ramírez Mattey
 * @version 0.1
 * @date 2022 - 08 - 01
 */


/**
 * IMPORTS / Requires
 */

const Console = require('./utilities/Console');
const config = require('./config.json');
/**
 * This will display the base banner
 */
function showBanner() {
    Console.space();
    Console.log('============================================');
    Console.log('     Board Game Geek Collage Generator      ');
    Console.log('============================================');
    Console.space();
    Console.log('Reading information from the user: ' + config.username);
    Console.space();
    Console.log('Filters:');
    Console.log(config.filters);
    Console.space();
}

/**
 * Main function
 */
async function main() {

    const BGGCanvasClass = require('./classes/BGGCanvas');
    // const users = ['arkofdan','mmolinam','crisguso93','Samhain_11','mesenius'];
    const users = config.users;
    for( let i = 0; i < users.length; i++ ){
        config.username = users[i];
        await showBanner();
        const BGG =  new BGGCanvasClass.BGGCanvas(config);
        const url = await BGG.getCollection();
    }
    const BGG =  new BGGCanvasClass.BGGCanvas(config);
    const url = await BGG.getCollection();

}


main();
// createCanvas();