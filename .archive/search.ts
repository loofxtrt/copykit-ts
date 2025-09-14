import logger from './generic/logger.js';
import path from 'path';
import fs from 'fs/promises'
import { isSymlink } from './generic/helpers.js';

async function searchFor(dir: string, searchTerm: string) {
    let results: string[] = [];
    let entries: string[] = [];

    try {
        entries = await fs.readdir(dir);
        logger.success('diretório lido com sucesso', dir);
    } catch {
        return [];
    }

    for (let file of entries) {
        if (await isSymlink(dir)) {
            continue;
        }

        try {
            file = path.join(dir, file);
            const stat = await fs.lstat(file);

            if (stat && stat.isDirectory()) {
                logger.info('iniciando leitura recursiva do diretório', file);
                results = results.concat(await searchFor(file, searchTerm));
            } else {
                if (file.includes(searchTerm)) {
                    logger.success('arquivo encontrado', file);
                    results.push(file);
                }
            }
        } catch (err) {
            logger.error('erro ao tentar iterar pelos resultados do diretório', dir);
            logger.caught(err);
            continue;
        }
    }
    
    return results;
}

console.log(await searchFor('/mnt/seagate/symlinks/copykit-data/data/original-unzipped/', 'audacity'));