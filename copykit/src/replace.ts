import fs from 'fs/promises';

async function fileExists(filePath: string): Promise<boolean> {
    // tentar acessar um arquivo pra verificar se ele existe
    // se usa access ao invés de existssync por causa do suporte ao assíncronismo
    try {
        await fs.access(filePath);
        return true;
    } catch (err) {
        console.error(`erro ao checar se ${fileExists} existe: ${err}`);
        return false;
    }
}

async function isSymlink(filePath: string): Promise<boolean> {
    try {
        // usa lstat em vez de stat pra que o caminho verificado seja o possível symlink em si
        // o stat navegaria até o arquivo original, fazendo isso sempre retornar false, mesmo sendo um symlink
        const stats = await fs.lstat(filePath);
        return stats.isSymbolicLink();
    } catch (err) {
        console.error(`erro ao checar se ${filePath} é um symlink: ${err}`);
        return false
    }
}

async function normalizeSvgName(fileName: string): Promise<string> {
    // adicionar .svg no final de um nome de arquivo caso necessário
    // tanto um nome de arquivo singular quanto um path inteiro podem ser passados
    if (!fileName.endsWith('.svg')) {
        return fileName += '.svg';
    } else {
        return fileName;
    }
}

export async function replace(targetIcons: string[], substituteIcon: string) {
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
        console.info(`o arquivo ${substituteIcon} não existe, pulando`);
        return;
    }

    // for tradicional em vez de foreach pra que a assíncronia dentro dos {} funcione
    // o for respeita os awaits dentro dele, enquanto o foreach ignoraria isso
    for (let target of targetIcons) {
        // adicionar .svg no final do path
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
        } catch (err) {
            console.error(`erro ao substituir ${target}: ${err}`);
        }
    };
}