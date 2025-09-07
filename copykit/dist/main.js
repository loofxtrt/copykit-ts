import { replace } from './replace.js';
import { remakeSymlinks } from './mk-symlinks.js';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import logger from './generic/logger.js';
async function handleReplaceFile(yamlPath) {
    /**
     * lê o arquivo yaml passado pra ela, e com base nas informações desse arquivo, chama o replace
     *
     * o targets-dir do arquivo indica onde a substituição deve ser basear
     * numa substituição de ícones de apps, se pareceria como: nomedopack/apps/scalable/{nomes a partir daqui}
     * e ao fim da função, os aliases/key da entrada do yaml são concatenados ao targets-dir, formando o path completo
     *
     * o substitutes-dir é onde os ícones substitutos estão localizados
     * assim como no targets, o valor da chave 'substitute' do yaml é concatenado com o path pra achar o ícone
     *
     * os aliases são todos os nomes que um mesmo arquivo pode ter. como gnome-settings, que tem o mesmo ícone de xfce-settings
     * a ignore-key pode ser usada pra que a key da entrada não conte como um desses aliases
     * não é estritamente necessário .svg no final desses aliases pq o replace já normaliza eles
     */
    // iniciar as variáveis aqui pq elas precisam ser usáveis fora do escopo do try
    let replaceMap = {};
    let targetsDir = '';
    let substitutesDir = '';
    // obter o mapeamento de replaces definido por arquivos yaml
    try {
        logger.info('iniciando leitura do mapa de substituição', yamlPath);
        // ler o arquivo yaml e transformar o conteúdo em um objeto js
        const textContent = fs.readFileSync(yamlPath, 'utf-8');
        const dataStructure = yaml.load(textContent); // assume que o arquivo yaml sempre vai ter a estrutura certa
        // retorno dos dados com segurança
        if (dataStructure) {
            // essas chaves devem estar presentes
            if (!('entries' in dataStructure) ||
                !('targets-dir' in dataStructure) ||
                !('substitutes-dir' in dataStructure)) {
                logger.error('uma das chaves obrigatórias não está presente no mapa');
                return;
            }
            // carrega o entries do arquivo como o replacemap
            replaceMap = dataStructure['entries'];
            // carregar os paths base definidos fora do entries
            targetsDir = dataStructure['targets-dir'];
            substitutesDir = dataStructure['substitutes-dir'];
        }
        else {
            logger.error(yamlPath, 'a leitura aconteceu mas falhou, possivelmente por:', '- ser null', '- não retornar um objeto', `- não possuir 'entries' como uma das chaves`);
        }
    }
    catch (err) {
        logger.error('erro ao ler o mapa de substituição', yamlPath);
        logger.caught(err);
    }
    // iterar por cada entrada no entries e realizar as ações necessárias
    Object.keys(replaceMap).forEach(entryKey => {
        // sem essa verificação precisaria de '?' toda vez que fosse referenciar o obj da entry
        if (!replaceMap[entryKey]) {
            logger.error('o objeto dos dados da entrada é inválido', entryKey);
            return;
        }
        const entry = replaceMap[entryKey];
        // obter o substituto
        let substitute = entry.substitute;
        if (!substitute) {
            logger.error('a entrada não tem um ícone substituto válido', entryKey);
            return;
        }
        // obter os aliases
        // ele é inicialmente definido como um array vazio pq esse campo pode não estar presente no objeto
        // se ele estiver presente, ele passa a ser considerado o aliases principal
        let aliases = [];
        if (entry.aliases) {
            aliases = entry.aliases;
        }
        // definir quais vão ser os alvos de substituição finais
        // por padrão, é key + aliases, mas se ignore-key for true, vão ser só os aliases
        let targets = [];
        const ignoreKey = entry['ignore-key'];
        if (!ignoreKey) {
            // além de adicionar o nome da key nos targets, também adicionar os aliases
            targets.push(entryKey);
            targets.concat(aliases);
            logger.info('considerando a chave da entrada como um dos aliases', entryKey);
        }
        else {
            // ignorar a key
            targets = aliases;
            logger.info('ignorando a chave da entrada', entryKey);
        }
        // formatar o caminho completo dos valores
        targets = targets.map(target => path.join(targetsDir, target));
        substitute = path.join(substitutesDir, substitute);
        // chamar a substituição
        replace(targets, substitute);
        // caso a flag de remake symlinks seja true
        const mkSymFlag = entry['remake-symlinks'];
        if (mkSymFlag) {
            // decidir o nome do arquivo o qual todos os demais symlinks vão apontar
            let mainIconName = '';
            if (!ignoreKey) {
                // usar o nome da chave como nome do arquivo principal
                mainIconName = entryKey;
            }
            else {
                // dar o nome do arquivo principal como o primeiro alias
                const firstAlias = aliases[0];
                if (typeof firstAlias === 'string') {
                    mainIconName = firstAlias;
                }
            }
            // refazer os symlinks
            remakeSymlinks(targets, substitute, mainIconName);
        }
    });
}
await handleReplaceFile('/mnt/seagate/workspace/coding/projects/scripts/copykit-ts/maps/test.yaml');
//# sourceMappingURL=main.js.map