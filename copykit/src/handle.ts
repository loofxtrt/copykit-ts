import { replace } from './replace.js';
import { remakeSymlinks } from './mk-symlinks.js';
import yaml from 'js-yaml';
import fs from 'fs/promises';
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
    'target-dir': string;
}

export async function handleReplaceMap(yamlPath: string, iconPackRoot: string, substitutesDir: string) {
    /**
     * lê o arquivo yaml passado pra ela, e com base nas informações desse arquivo, chama o replace
     * 
     * @param iconPackRoot
     * indica onde a substituição deve ser basear, a raíz do icon pack
     * isso vai ser concatenado com o target-dir obtido do arquivo yaml, e depois com os aliases, formando o path completo
     * ex: iconpackroot/targetdir/alias = copycat/apps/scalable/firefox.svg
     * 
     * @param substitutesDir
     * onde os ícones substitutos estão localizados
     * assim como no targets, o valor da chave 'substitute' do yaml é concatenado com o path pra achar o ícone
     * 
     * DENTRO DO ARQUIVO YAML:
     * target-dir é a subpasta em que os aliases se encontram a partir da raíz do icon pack
     * isso pra softwares por exemplo, geralmente é apps/scalable ou scalable/apps
     * 
     * os aliases são todos os nomes que um mesmo arquivo pode ter. como gnome-settings, que tem o mesmo ícone de xfce-settings
     * a ignore-key pode ser usada pra que a key da entrada não conte como um desses aliases
     * não é estritamente necessário .svg no final desses aliases pq o replace já normaliza eles
     * 
     * caso remake-symlinks seja true na entrada, o script vai apagar todos os arquivos indicados no alises
     * e depois, criar um único arquivo, e recriar todos os aliases agora como symlinks, que apontam pro caminho principal
     * serve pra deshardcodar múltiplos ícones repetidos que poderiam ser só symlinks, tipo os mimetypes de zip
     */

    // iniciar as variáveis aqui pq elas precisam ser usáveis fora do escopo do try
    let replaceMap: ReplaceMap = {};
    let targetDir: string = '';

    // obter o mapeamento de replaces definido pelo arquivo yaml
    try {
        logger.init('iniciando leitura do mapa de substituição', yamlPath);

        // ler o arquivo yaml e transformar o conteúdo em um objeto js
        const textContent = await fs.readFile(yamlPath, 'utf-8');
        const dataStructure = yaml.load(textContent) as ReplacementStructure; // assume que o arquivo yaml sempre vai ter a estrutura certa

        // retorno dos dados com segurança
        if (dataStructure) {
            if (!('entries' in dataStructure) || !('target-dir' in dataStructure)) {
                logger.error(`alguma das chaves obrigatórias não estão presentes no mapa`);
                return;
            }

            // carrega o entries do arquivo como o replacemap e define o targetdir
            replaceMap = dataStructure['entries'] as ReplaceMap;
            
            targetDir = dataStructure['target-dir'] as string;
            targetDir = path.join(iconPackRoot, targetDir);
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
            
            // logger desnecessário pra funcionamento comum
            //logger.info('considerando a chave da entrada como um dos aliases', entryKey);
        } else {
            // ignorar a key
            targets = aliases;
            logger.info('ignorando a chave da entrada', entryKey);
        }

        // formatar o caminho completo dos valores
        targets = targets.map(target => path.join(targetDir, target));
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
            remakeSymlinks(targets, substitute, path.join(targetDir, mainIconName));
        }
    });
}