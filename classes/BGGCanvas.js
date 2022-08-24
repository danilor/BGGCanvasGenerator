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
 * @date 2022 - 07 - 01
 */

const fs = require('fs-extra');
const fetch = require('node-fetch');
const Console = require('../utilities/Console');
const Ut = require('../utilities/Util');

class BGGCanvas {

    resultingURL = '';
    filenameSeparator = '_';

    /**
     * Constructor
     */
    constructor(config) {
        this.config = config;
    }

    async download(uri, filename) {
        this.l('Saving image:');
        this.l(' > ' + uri);
        this.l(' > ' + filename);
        this.s();
        const exists = await fs.exists(this.config.images.temporal_folder + filename);
        if (!exists) {
            this.l('File does not exist on local. Downloading it');
            const response = await fetch(uri);
            const buffer = await response.buffer();
            await fs.writeFile(this.config.images.temporal_folder + filename, buffer);
        } else {
            this.l('File already exists. Using the local one');
        }
    }


    /**
     * The idea of this one is to save images. It will overwrite/update those that we don't have just yet
     * It will use the thumgnails for them
     */
    async saveImages(items) {
        const arrayWithItems = [];
        for (let i = 0; i < items.length; i++) {
            this.l('[IMAGE ' + i + ']');
            const builtName = items[i][this.config.images.images_name] + '.' + this.config.images.images_extension;


            await this.download(items[i][this.config.images.images_attribute], builtName);
            arrayWithItems.push(builtName);
        }
        return arrayWithItems;
    }


    /**
     * This will read the whole collection defined in the config.json file.
     */
    async getCollection() {
        this.l('Getting collection information');
        /**
         * Client got from https://www.npmjs.com/package/bgg-xml-api-client
         */
        const bggClient = require('bgg-xml-api-client');

        let listOfFilters = null;

        if (typeof this.config.filters === 'object' && this.config.filters.length > 0) {
            // It is an array
            listOfFilters = this.config.filters;
        } else if (typeof this.config.filters === 'object') {
            listOfFilters = [];
            listOfFilters.push({
                name: 'general',
                query: this.config.filters
            })
        } else {
            listOfFilters = [];

        }


        for (let i = 0; i < listOfFilters.length; i++) {
            const currentFilterName = listOfFilters[i].name;
            const currentFilterQuery = listOfFilters[i].query;

            const results = await bggClient.getBggCollection({
                ...currentFilterQuery,
                username: this.config.username
            });

            const items = results.data.item;

            this.l('BGG Results for query');
            this.l(currentFilterQuery);
            this.l('Total items: ' + items.length);
            this.s();

            /**
             * We write a temp file with the user information
             */
            await fs.writeFile(this.config.collections + this.config.username + this.filenameSeparator + currentFilterName + '.json', JSON.stringify(items));

            /**
             * Now that we have the collection, we need to save all the images in the temp folder using the ID
             * of the board game.
             * It will return the array with images that we can use to save our canvas
             */

            const arrayWithItems = await this.saveImages(items);

            await this.createCanvasProcess(arrayWithItems, currentFilterName);

        }


        return this.resultingURL;

    }


    /**
     * This method will create the canvas.
     * This is the meat of this code
     * TESTING MODE
     */
    async createCanvasProcess(items, type = 'general') {

        this.l('Creating the canvas for the collage');
        const {createCanvas, loadImage} = require('canvas');

        /**
         * If we want to have a fixed amount of cols, we can set it up in the config file
         * and call it here
         * @type {number}
         */
        const cols = Math.ceil(Math.sqrt(items.length));

        const grouped = Ut.chunk(items, cols);
        this.l('Grouped array');
        this.l(grouped);

        /**
         * First we create the canvas
         */

        const fullW = this.config.canvas.w * cols;

        const fullH = this.config.canvas.h * grouped.length;

        const canvas = createCanvas(
            fullW,
            fullH
        );
        const ctx = canvas.getContext('2d');
        // We created the canvas with a solid background color
        this.l('Setting up the background');
        ctx.fillStyle = this.config.canvas.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        /**
         * Lets load all images
         */

        for (let rows = 0; rows < grouped.length; rows++) {
            for (let cols = 0; cols < grouped[rows].length; cols++) {
                this.l('Loading image: ' + grouped[rows][cols]);
                const image = await loadImage(this.config.images.temporal_folder + grouped[rows][cols]);

                /**
                 * Now, if the square option is enabled, we need to square the images
                 */

                let auxCanvas = null;
                /**
                 * If crop square is true, instead of streaching the images
                 * we need to crop them down
                 */
                if (this.config.canvas.cropSquare === true) {
                    this.l('Squaring image');
                    const maxSize = (image.height > image.width ? image.height : image.width);
                    const minSize = (image.height > image.width ? image.width : image.height);
                    auxCanvas = createCanvas(minSize, minSize); // This is the exact same size of the image we want to add
                    const auxContext = auxCanvas.getContext('2d');

                    /**
                     * Now the crop needs to be done depending on the option selected.
                     * Available options:
                     *  - top-left
                     *  -center
                     */

                    switch (this.config.canvas.cropType) {
                        case 'top-left':
                            this.l('Cropping image Top Left');
                            await auxContext.drawImage(
                                image,
                                0, 0,
                                image.width, image.height
                            );
                            break;
                        case 'center':
                            this.l('Cropping image center');
                            this.l('Min Size: ' + minSize);
                            const leftAux = image.width - minSize;
                            const topAux = image.height - minSize;

                            let left = 0;
                            let top = 0;

                            if (leftAux !== 0) {
                                left = -1 * Math.round(leftAux / 2);
                            }
                            if (topAux !== 0) {
                                top = -1 * Math.round(topAux / 2);
                            }

                            this.l('Image Information');
                            this.l('W: ' + image.width);
                            this.l('H:' + image.height);
                            this.l('Provided Top: ' + top);
                            this.l('Provided Left: ' + left);
                            await auxContext.drawImage(
                                image,
                                left, top,
                                image.width, image.height
                            );
                            break;
                    }

                } else {
                    auxCanvas = image;
                }
                const posX = cols * this.config.canvas.w;
                const posY = rows * this.config.canvas.h;
                await ctx.drawImage(
                    auxCanvas,
                    posX, posY,
                    this.config.canvas.w, this.config.canvas.h
                );
                this.s();
            }
        }


        /**
         * Lets see if we need to write the username
         */

        if (this.config.canvas.writeUsername) {
            // Write "Awesome!"
            const distance = 25;
            const textHeight = 20;
            const usernameToUser = this.config.username;
            ctx.strokeStyle = 'black';
            ctx.font = textHeight + 'px Calibri white';

            ctx.fillText(usernameToUser, distance, distance);
            ctx.strokeText(usernameToUser, distance, distance);
            const text = ctx.measureText('Awesome!')
            ctx.fillText(usernameToUser, fullW - distance - text.width, fullH - distance - textHeight);
            ctx.strokeText(usernameToUser, fullW - distance - text.width, fullH - distance - textHeight);
        }

        this.l('Writing the resulting image');
        const buffer = await canvas.toBuffer("image/png");
        const fileDesination = this.config.canvas.destination + this.config.username + this.filenameSeparator + type + ".png";
        await fs.writeFileSync(fileDesination, buffer);

        /**
         * If the open result option is true, then we open the resulting image
         * DEPRECATED
         */
        // if (this.config.openResult === true) {
        //     const open = require('open');
        //     await open(fileDesination);
        // }
        this.resultingURL = fileDesination;
        return fileDesination;
    }


    /**
     * Log wrapper
     */
    l(t) {
        Console.log(t);
    }

    /**
     * Space wrapper
     */
    s() {
        Console.space();
    }


}

module.exports.BGGCanvas = BGGCanvas;