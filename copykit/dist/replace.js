import fs from 'fs/promises';
import { fileExists, isSymlink, normalizeSvgName } from './generic/helpers.js';
import logger from './generic/logger.js';
export async function replace(targetIcons, substituteIcon) {
    /**
     * obtém um grupo de arquivos e substitui eles com um único ícone
     * ambos os parâmetros devem ser paths completos
     *
     * @param targetIcons:
     *  o grupo de ícones que devem ser substituídos
     *
     * @param substituteIcon:
     *  o ícone pelo qual os do grupo vão ser substituídos
     */
    // checar se o ícone substituto é válido
    substituteIcon = await normalizeSvgName(substituteIcon);
    if (!await fileExists(substituteIcon)) {
        logger.error('o arquivo de substituição é inválido', substituteIcon);
        return;
    }
    // for tradicional em vez de foreach pra que a assíncronia dentro dos {} funcione
    // o for respeita os awaits dentro dele, enquanto o foreach ignoraria isso
    for (let target of targetIcons) {
        // adicionar .svg no final do path
        target = await normalizeSvgName(target);
        if (!await fileExists(target)) {
            logger.info('o arquivo a ser substituído não existe, criando ele agora', target);
        }
        // não tem necessidade de substituir symlinks, passa pro próximo arquivo
        if (await isSymlink(target)) {
            logger.info('pulando o arquivo por ser um symlink', target);
            continue;
        }
        // copiar o arquivo substituto e sobreescrever o target
        try {
            fs.copyFile(substituteIcon, target);
            logger.success('arquivo substituído com sucesso', `alvo:       ${target}`, `substituto: ${substituteIcon}`);
        }
        catch (err) {
            logger.error('erro ao substituir o arquivo', target);
            logger.caught(err);
        }
    }
    ;
}
//# sourceMappingURL=replace.js.map