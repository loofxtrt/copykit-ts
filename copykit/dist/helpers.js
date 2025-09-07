import fs from 'fs/promises';
export async function fileExists(filePath) {
    // tentar acessar um arquivo pra verificar se ele existe
    // se usa access ao invés de existssync por causa do suporte ao assíncronismo
    try {
        await fs.access(filePath);
        return true;
    }
    catch {
        return false;
    }
}
export async function isSymlink(filePath) {
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
export async function normalizeSvgName(fileName) {
    // adicionar .svg no final de um nome de arquivo caso necessário
    // tanto um nome de arquivo singular quanto um path inteiro podem ser passados
    if (!fileName.endsWith('.svg')) {
        return fileName += '.svg';
    }
    else {
        return fileName;
    }
}
//# sourceMappingURL=helpers.js.map