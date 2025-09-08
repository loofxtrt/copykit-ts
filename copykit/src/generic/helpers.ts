import fs from 'fs/promises';
import logger from './logger.js';

export async function fileExists(filePath: string): Promise<boolean> {
    /**
     * tentar acessar um arquivo pra verificar se ele existe
     * 
     * antes, se usava fs.access ao invés de existssync por causa do suporte ao assíncronismo
     * mas agora também se usa lstat nessa func pq o lstat NÃO SEGUE O SYMLINK
     * ele verifica o symlink como se fosse um arquivo real, não tentando verificar pra onde ele aponta
     */ 
    try {
        await fs.lstat(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function isSymlink(filePath: string, silent: boolean = true): Promise<boolean> {
    try {
        // usa lstat em vez de stat pra que o caminho verificado seja o possível symlink em si
        // o stat navegaria até o arquivo original, fazendo isso sempre retornar false, mesmo sendo um symlink
        const stats = await fs.lstat(filePath);
        return stats.isSymbolicLink();
    } catch {
        // loggar o erro caso isso seja explicitamente pedido pela flag
        if (!silent) logger.error('o arquivo (ou a ausência dele) não é um symlink', filePath);
        return false
    }
}

export async function normalizeSvgName(fileName: string): Promise<string> {
    // adicionar .svg no final de um nome de arquivo caso necessário
    // tanto um nome de arquivo singular quanto um path inteiro podem ser passados
    if (!fileName.endsWith('.svg')) {
        return fileName += '.svg';
    } else {
        return fileName;
    }
}

export async function normalizeYamlName(fileName: string): Promise<string> {
    // mesma coisa do normalizesvg, mas pra yaml
    if(!fileName.endsWith('.yaml') || !fileName.endsWith('.yml')) {
        return fileName += '.yaml';
    } else {
        return fileName;
    }
}