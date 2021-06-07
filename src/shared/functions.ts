import logger from './logger';

export const pErr = (err: Error) => {
    if (err) {
        logger.err(err);
    }
};

export const getRandomInt = () => {
    return Math.floor(Math.random() * 1_000_000_000_000);
};

export const getColors = require('image-pal-sharp/lib/rgb');

export const getColorFromBuffer = (buffer: Buffer): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        getColors({
            srcBuffer: buffer,
            order: 'density'
        }, (err: Error, colors: any[]) => {
            const colorPlate: string[] = [];
            if (err) return void console.error('oops!', err.stack || err);
            for (let index = 0; index < colors.length; index++) {
                const color = colors[index];
                colorPlate.push(color.hex);
            }
            resolve(colorPlate)

        });
    })
}