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
 * @date 2022 - 07 - 29
 */


/**
 * IMPORTS / Requires
 */

const fs = require('fs-extra');
const fetch = require('node-fetch');
const Console = require('./utilities/Console');
const config = require('./config.json');
const Ut = require('./utilities/Util');

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


async function download(uri, filename) {

    Console.log('Saving image:');
    Console.log(' > ' + uri);
    Console.log(' > ' + filename);
    Console.space();

    const response = await fetch(uri);
    const buffer = await response.buffer();
    await fs.writeFile(config.images.temporal_folder + filename, buffer);

}

/**
 * The idea of this one is to save images. It will overwrite/update those that we don't have just yet
 * It will use the thumgnails for them
 */
async function saveImages(items) {
    const arrayWithItems = [];
    for (let i = 0; i < items.length; i++) {
        Console.log('[IMAGE ' + i + ']');
        const builtName = items[i][config.images.images_name] + '.' + config.images.images_extension;
        await download(items[i][config.images.images_attribute], builtName);
        arrayWithItems.push(builtName);
    }
    return arrayWithItems;
}

/**
 * This will read the whole collection defined in the config.json file.
 */
async function getCollection() {
    Console.log('Getting collection information');
    /**
     * Client got from https://www.npmjs.com/package/bgg-xml-api-client
     */
    const bggClient = require('bgg-xml-api-client');

    const results = await bggClient.getBggCollection({
        ...config.filters,
        username: config.username
    });

    const items = results.data.item;

    Console.log('BGG Results');
    Console.log('Total items: ' + items.length);
    Console.space();

    /**
     * We write a temp file with the user information
     */
    await fs.writeFile(config.collections + config.username + '.json', JSON.stringify(items));

    /**
     * Now that we have the collection, we need to save all the images in the temp folder using the ID
     * of the board game.
     * It will return the array with images that we can use to save our canvas
     */

    const arrayWithItems = await saveImages(items);

    await createCanvas(arrayWithItems);


}


/**
 * This method will create the canvas.
 * This is the meat of this code
 * TESTING MODE
 */
async function createCanvas(items) {

    Console.log('Creating the canvas for the collage');
    const {createCanvas, loadImage} = require('canvas');

    /**
     * If we want to have a fixed amount of cols, we can set it up in the config file
     * and call it here
     * @type {number}
     */
    const cols = Math.ceil(Math.sqrt(items.length));

    const grouped = Ut.chunk(items, cols);
    Console.log('Grouped array');
    Console.log(grouped);

    /**
     * First we create the canvas
     */

    const fullW = config.canvas.w * cols;

    const fullH = config.canvas.h * grouped.length;

    const canvas = createCanvas(
        fullW,
        fullH
    );
    const ctx = canvas.getContext('2d');
    // We created the canvas with a solid background color
    Console.log('Setting up the background');
    ctx.fillStyle = config.canvas.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /**
     * Lets load all images
     */

    for (let rows = 0; rows < grouped.length; rows++) {
        for (let cols = 0; cols < grouped[rows].length; cols++) {
            Console.log('Loading image: ' + grouped[rows][cols]);
            const image = await loadImage(config.images.temporal_folder + grouped[rows][cols]);
            
            /**
             * Now, if the square option is enabled, we need to square the images
             */

            let auxCanvas = null;
            /**
             * If crop square is true, instead of streaching the images
             * we need to crop them down
             */
            if( config.canvas.cropSquare === true){
                Console.log('Squaring image');
                const maxSize = ( image.height > image.width ? image.height : image.width );
                const minSize = ( image.height > image.width ? image.width : image.height );
                auxCanvas = createCanvas(minSize, minSize); // This is the exact same size of the image we want to add
                const auxContext = auxCanvas.getContext('2d');

                /**
                 * Now the crop needs to be done depending on the option selected.
                 * Available options:
                 *  - top-left
                 *  -center
                 */

                switch(config.canvas.cropType){
                    case 'top-left':
                        Console.log('Cropping image Top Left');
                        await auxContext.drawImage(
                            image, 
                            0, 0, 
                            image.width, image.height
                        );
                    break;
                    case 'center':
                        Console.log('Cropping image center');
                        Console.log('Min Size: ' + minSize);
                        const leftAux = image.width - minSize;
                        const topAux = image.height - minSize;

                        let left = 0;
                        let top = 0;

                        if( leftAux !== 0 ){
                            left = -1 * Math.round(leftAux / 2);
                        }
                        if( topAux !== 0 ){
                            top = -1 * Math.round(topAux / 2);
                        }

                        Console.log('Image Information');
                        Console.log('W: ' + image.width);
                        Console.log('H:' + image.height);
                        Console.log('Provided Top: ' + top);
                        Console.log('Provided Left: ' + left);
                        await auxContext.drawImage(
                            image, 
                            left, top, 
                            image.width, image.height
                        );
                    break;
                }

            }else{
                auxCanvas = image;
            }
            const posX = cols * config.canvas.w;
            const posY = rows * config.canvas.h;
            await ctx.drawImage(
                auxCanvas, 
                posX, posY, 
                config.canvas.w, config.canvas.h
            );
            Console.space();
        }
    }


    /**
     * Lets see if we need to write the username
     */

    if( config.canvas.writeUsername ){
        // Write "Awesome!"
        const distance = 25;
        const textHeight = 20;
        const usernameToUser = config.username;
        ctx.strokeStyle = 'black';
        ctx.font = textHeight+'px Calibri white';

        ctx.fillText(usernameToUser, distance, distance);
        ctx.strokeText(usernameToUser, distance, distance);


        const text = ctx.measureText('Awesome!')


        ctx.fillText(usernameToUser, fullW - distance - text.width, fullH - distance - textHeight);
        ctx.strokeText(usernameToUser, fullW - distance - text.width, fullH - distance - textHeight);
    }

    Console.log('Writing the resulting image');
    const buffer = await canvas.toBuffer("image/png");
    const fileDesination = config.canvas.destination+config.username+".png";
    await fs.writeFileSync(fileDesination, buffer);

    /**
     * If the open result option is true, then we open the resulting image
     */
    if(config.openResult === true){
        const open = require('open');
        await open(fileDesination);
    }
}

/**
 * Main function
 */
async function main() {
    showBanner();
    await getCollection();
}


main();
// createCanvas(); 