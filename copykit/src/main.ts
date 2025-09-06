import { replace } from "./replace.js";
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';

// criar os tipos principais pro objeto de replacemap

// replaceentry representa uma entrada singular, como um app
type ReplaceEntry = {
    'substitute': string;   // nome do arquivo (não o path completo) do ícone substituto
    'aliases'?: string[];   // não obrigatório. algumas entradas podem ter apenas um nome, que é a chave
    'ignore-key'?: boolean; // se for true, a chave que contém esse obj não vai ser considerada como parte dos aliases
};

// replacemap representa um conjunto de vários replaceentry
// ele cria um objeto que tem strings como chaves (o nome da entrada, como 'spotify')
// e atribuído a essa chave, tem um obj que representa a entrada (substituto do spotify, aliases etc)
type ReplaceMap = Record<string, ReplaceEntry>;

type ReplacementStructure = {
    'entries': ReplaceMap;
    'targets-dir': string;
    'substitutes-dir': string;
}

async function main() {
    let replaceMap: ReplaceMap = {};
    let targetsDir: string = '';
    let substitutesDir: string = '';

    // obter o mapeamento de replaces definido por arquivos yaml
    try {
        // ler o arquivo yaml e transformar o conteúdo em um objeto js
        const yamlPath = '/mnt/seagate/workspace/coding/projects/scripts/copykit-ts/maps/test.yaml';
        const textContent = fs.readFileSync(yamlPath, 'utf-8');
        const dataStructure = yaml.load(textContent) as ReplacementStructure;

        // retorno dos dados com segurança
        if (dataStructure) {
            // essas chaves devem estar presentes
            if (
                !('entries' in dataStructure) ||
                !('targets-dir' in dataStructure) ||
                !('substitutes-dir' in dataStructure)
            ) {
                console.error(`uma das chaves obrigatórias não está presente no arquivo`);
                return;
            }

            // carrega o entries do arquivo como o replacemap
            replaceMap = dataStructure['entries'] as ReplaceMap;

            // carregar os paths base definidos fora do entries
            targetsDir = dataStructure['targets-dir'];
            substitutesDir = dataStructure['substitutes-dir'];
        } else {
            console.error(`o resultado da leitura de ${yamlPath} falhou. possivelmente por:\n
                - ser null\n
                - não retornar um objeto\n
                - não possuir 'entries' como uma das chaves`
            );
        }
    } catch (err) {
        console.error(err);
    }

    // iterar por cada entrada no entries e realizar as ações necessárias
    Object.keys(replaceMap).forEach(entry => {
        // obter o substituto
        let substitute = replaceMap[entry]?.substitute;

        if (!substitute) {
            console.error(`a entrada ${entry} não tem um ícone substituto válido`);
            return;
        }

        // obter os aliases
        // ele é inicialmente definido como um array vazio pq esse campo pode não estar presente no objeto
        // se ele estiver, ele passa a ser considerado o aliases principal
        let aliases: string[] = [];

        const getAliases = replaceMap[entry]?.aliases;
        if (getAliases) {
            aliases = getAliases;
        }

        // definir quais vão ser os alvos de substituição finais
        // por padrão, é key + aliases, mas se ignore-key for true, vão ser só os aliases
        let targets: string[] = [];
        const ignoreKey = replaceMap[entry]?.['ignore-key'];

        if (!ignoreKey) {
            // além de adicionar o nome da key nos targets, também adicionar os aliases
            targets.push(entry);
            targets.concat(aliases);
        } else {
            // ignorar a key
            targets = aliases;
        }

        // formatar o caminho completo dos valores
        targets = targets.map(target => path.join(targetsDir, target));
        substitute = path.join(substitutesDir, substitute);

        // chamar a substituição
        replace(targets, substitute);
    });
}

await main();