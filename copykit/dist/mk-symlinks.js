import fs from 'fs/promises';
import path from 'path';
import { fileExists, normalizeSvgName } from './generic/helpers.js';
import logger from './generic/logger.js';
export async function remakeSymlinks(targetFiles, copyMainFrom, pasteMainInto) {
    /**
     * @param targetFiles
     *  array de PATHS COMPLETOS de todos os arquivos que devem ser deletados
     *  pra depois serem convertidos pra symlinks
     *
     * @param copyMainFrom
     *  PATH COMPLETO de onde o ícone principal deve ser copiado
     *
     * @param pasteMainInto
     * PATH COMPLETO, INCLUINDO O NOVO NOME DO ÍCONE PRINCIPAL NO FINAL
     * onde ele deve ser colado. normalmente o mesmo diretório pai de todas as targetfiles anteriores
     * o nome da nova cópia também deve estar incluso no final do path. ex: pack/apps/scalable/nomedacopia.svg
     */
    // normalizar todos os valores, adicionando .svg no fim de cada um caso necessário
    targetFiles = await Promise.all(targetFiles.map(async (target) => await normalizeSvgName(target)));
    copyMainFrom = await normalizeSvgName(copyMainFrom);
    pasteMainInto = await normalizeSvgName(pasteMainInto);
    // deletar todos os arquivos antes de fazer qualquer outra coisa
    for (const file of targetFiles) {
        logger.info('incialização remoção de arquivos aliases');
        // obter o nome sem a extensão tbm
        // pq pode ter algum arquivo assim criado por engano
        const extensionless = path.parse(file).name;
        const filesToCheck = [file, extensionless];
        // excluir os arquivos caso eles existam
        for (const f of filesToCheck) {
            if (!await fileExists(f)) {
                logger.info('pulando arquivo inexistente', f);
                continue;
            }
            await fs.unlink(f);
            logger.info('arquivo deletado', f);
        }
    }
    // criar o arquivo principal
    try {
        await fs.copyFile(copyMainFrom, await normalizeSvgName(pasteMainInto));
        logger.success('arquivo principal copiado', `de:   ${copyMainFrom}`, `para: ${pasteMainInto}`);
    }
    catch (err) {
        logger.error('erro ao copiar o arquivo principal', copyMainFrom);
        logger.caught(err);
    }
    // criar os symlinks que apontam pro arquivo principal
    let mainRelativeName = path.basename(pasteMainInto); // nome relativo sem o resto do path
    for (let file of targetFiles) {
        // ignorar o arquivo principal
        // sem isso, criaria um symlink com o mesmo nome dele apontando pra ele mesmo
        if (file.endsWith(mainRelativeName)) {
            logger.info(`pulando criação de symlink pro arquivo que contém o mesmo nome do arquivo principal '${mainRelativeName}'`, file);
            continue;
        }
        try {
            await fs.symlink(mainRelativeName, file);
            logger.success('symlink criado', `target: ${mainRelativeName}`, `path:   ${file}`);
        }
        catch (err) {
            logger.error('erro ao criar symlink', mainRelativeName, file);
            logger.caught(err);
        }
    }
}
//# sourceMappingURL=mk-symlinks.js.map