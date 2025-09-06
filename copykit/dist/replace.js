import fs from 'fs/promises';
import path from 'path';
async function fileExists(filePath) {
    // tentar acessar um arquivo pra verificar se ele existe
    // se usa access ao invés de existssync por causa do suporte ao assíncronismo
    try {
        await fs.access(filePath);
        return true;
    }
    catch (err) {
        console.error(`erro ao checar se ${fileExists} existe: ${err}`);
        return false;
    }
}
async function isSymlink(filePath) {
    try {
        // usa lstat em vez de stat pra que o caminho verificado seja o possível symlink em si
        // o stat navegaria até o arquivo original, fazendo isso sempre retornar false, mesmo sendo um symlink
        const stats = await fs.lstat(filePath);
        return stats.isSymbolicLink();
    }
    catch (err) {
        console.error(`erro ao checar se ${filePath} é um symlink: ${err}`);
        return false;
    }
}
async function normalizeSvgName(fileName) {
    // adicionar .svg no final de um nome de arquivo caso necessário
    // apenas o nome do arquivo deve ser passado, não um path inteiro
    if (!fileName.endsWith('.svg')) {
        return fileName += '.svg';
    }
    else {
        return fileName;
    }
}
export async function replace(targetIcons, substituteIcon) {
    // checar se o ícone substituto é válido
    substituteIcon = await normalizeSvgName(substituteIcon);
    if (!await fileExists(substituteIcon)) {
        console.error(`arquivo do ícone de substituição inválido: ${substituteIcon}`);
        return;
    }
    // for tradicional em vez de foreach pra que a assíncronia dentro dos {} funcione
    // o for respeita os awaits dentro dele, enquanto o foreach ignoraria isso
    for (let target of targetIcons) {
        // add .svg
        target = await normalizeSvgName(target);
        if (!await fileExists(target)) {
            console.error(`arquivo a ser substituído inválido: ${target}`);
            continue;
        }
        // não tem necessidade de substituir symlinks, passa pro próximo arquivo
        if (await isSymlink(target)) {
            console.log(`pulando ${target} por ser um symlink`);
            continue;
        }
        // copiar o arquivo substituto e sobreescrever o target
        try {
            fs.copyFile(substituteIcon, target);
            console.log(`${target} substituído com sucesso por ${substituteIcon}`);
        }
        catch (err) {
            console.error(`erro ao substituir ${target}: ${err}`);
        }
    }
    ;
}
//# sourceMappingURL=replace.js.map