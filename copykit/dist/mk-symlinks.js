import fs from 'fs/promises';
import path from 'path';
import { fileExists, normalizeSvgName } from './generic/helpers.js';
import logger from './generic/logger.js';
export async function remakeSymlinks(targetFiles, mainIconPath, mainIconName) {
    let newIconName = await normalizeSvgName(mainIconName);
    for (let file of targetFiles) {
        file = await normalizeSvgName(file);
        if (!await fileExists(file)) {
            logger.info('pulando arquivo inexistente', file);
            continue;
        }
        fs.unlink(file);
        logger.info('arquivo deletado', file);
    }
}
//# sourceMappingURL=mk-symlinks.js.map