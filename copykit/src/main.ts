import { replace } from './replace.js';
import { remakeSymlinks } from './mk-symlinks.js';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import logger from './generic/logger.js';

// criar os tipos principais pro objeto de replacemap
// replaceentry representa uma entrada singular dentro do 'entries'
type ReplaceEntry = {
    'substitute': string;   // nome do arquivo (não o path completo) do ícone substituto
    'aliases'?: string[];   // não obrigatório. algumas entradas podem ter apenas um nome, que é a chave
    'ignore-key'?: boolean; // se for true, a chave que contém esse obj não vai ser considerada como parte dos aliases
    
    // se for true, significa que todos os aliases devem ser deletados, incluindo os hardcodeds
    // e depois, apontar um único arquivo como o principal (a chave, caso ignore-key seja false, ou o primeiro índice dos aliases caso seja true)
    // e recriar todos os aliases agora como symlinks que apontam pro arquivo principal
    'remake-symlinks'?: boolean;
};

// replacemap representa um conjunto de vários replaceentry
// ele cria um objeto que tem strings como chaves (o nome da entrada, como 'spotify')
// e atribuído a essa chave, tem um obj que representa a entrada (substituto do spotify, aliases etc)
type ReplaceMap = Record<string, ReplaceEntry>;

// replacementstructure representa o arquivo inteiro
// ele deve ter apenas as entradas principais
type ReplacementStructure = {
    'entries': ReplaceMap;
    'targets-dir': string;
    'substitutes-dir': string;
}

async function handleReplaceFile(yamlPath: string) {
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
     * 
     * caso remake-symlinks seja true na entrada, o script vai apagar todos os arquivos indicados no alises
     * e depois, criar um único arquivo, e recriar todos os aliases agora como symlinks, que apontam pro caminho principal
     * serve pra deshardcodar múltiplos ícones repetidos que poderiam ser só symlinks
     */

    // iniciar as variáveis aqui pq elas precisam ser usáveis fora do escopo do try
    let replaceMap: ReplaceMap = {};
    let targetsDir: string = '';
    let substitutesDir: string = '';

    // obter o mapeamento de replaces definido por arquivos yaml
    try {
        logger.info('iniciando leitura do mapa de substituição', yamlPath);

        // ler o arquivo yaml e transformar o conteúdo em um objeto js
        const textContent = fs.readFileSync(yamlPath, 'utf-8');
        const dataStructure = yaml.load(textContent) as ReplacementStructure; // assume que o arquivo yaml sempre vai ter a estrutura certa

        // retorno dos dados com segurança
        if (dataStructure) {
            // essas chaves devem estar presentes
            if (
                !('entries' in dataStructure) ||
                !('targets-dir' in dataStructure) ||
                !('substitutes-dir' in dataStructure)
            ) {
                logger.error('uma das chaves obrigatórias não está presente no mapa');
                return;
            }

            // carrega o entries do arquivo como o replacemap
            replaceMap = dataStructure['entries'] as ReplaceMap;

            // carregar os paths base definidos fora do entries
            targetsDir = dataStructure['targets-dir'];
            substitutesDir = dataStructure['substitutes-dir'];
        } else {
            logger.error(
                yamlPath,
                'a leitura aconteceu mas falhou, possivelmente por:',
                '- ser null',
                '- não retornar um objeto',
                `- não possuir 'entries' como uma das chaves`
            );
        }
    } catch (err) {
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
        let aliases: string[] = [];

        if (entry.aliases) {
            aliases = entry.aliases;
        }

        // definir quais vão ser os alvos de substituição finais
        // por padrão, é key + aliases, mas se ignore-key for true, vão ser só os aliases
        let targets: string[] = [];
        const ignoreKey = entry['ignore-key'];

        if (!ignoreKey) {
            // além de adicionar o nome da key nos targets
            // também somar o array de aliases com o de targets
            targets.push(entryKey);
            targets.push(...aliases);
            
            logger.info('considerando a chave da entrada como um dos aliases', entryKey);
        } else {
            // ignorar a key
            targets = aliases;
            logger.info('ignorando a chave da entrada', entryKey);
        }

        // formatar o caminho completo dos valores
        targets = targets.map(target => path.join(targetsDir, target));
        substitute = path.join(substitutesDir, substitute);

        // chamar as funções
        const mkSymFlag = entry['remake-symlinks'];
        
        if (!mkSymFlag) {
            // substituição normal
            replace(targets, substitute);
        }

        if (mkSymFlag) {
            // criação de symlinks

            // decidir o nome do arquivo o qual todos os demais symlinks vão apontar
            let mainIconName: string = '';

            if (!ignoreKey) {
                // usar o nome da chave como nome do arquivo principal
                mainIconName = entryKey;
            } else {
                // dar o nome do arquivo principal como o primeiro alias
                const firstAlias = aliases[0];
                if (typeof firstAlias === 'string') {
                    mainIconName = firstAlias;
                }
            }

            // refazer os symlinks
            remakeSymlinks(targets, substitute, path.join(targetsDir, mainIconName));
        }
    });
}

await handleReplaceFile('/mnt/seagate/workspace/coding/projects/scripts/copykit-ts/maps/test.yaml');