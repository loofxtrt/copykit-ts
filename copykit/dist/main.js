import { replace } from "./replace.js";
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
async function main() {
    let replaceMap = {};
    let targetsDir = '';
    let substitutesDir = '';
    // obter o mapeamento de replaces definido por arquivos yaml
    try {
        // ler o arquivo yaml e transformar o conteúdo em um objeto js
        const yamlPath = '/mnt/seagate/workspace/coding/projects/scripts/copykit-ts/maps/test.yaml';
        const textContent = fs.readFileSync(yamlPath, 'utf-8');
        const dataStructure = yaml.load(textContent);
        // retorno dos dados com segurança
        if (dataStructure) {
            // essas chaves devem estar presentes
            if (!('entries' in dataStructure) ||
                !('targets-dir' in dataStructure) ||
                !('substitutes-dir' in dataStructure)) {
                console.error(`uma das chaves obrigatórias não está presente no arquivo`);
                return;
            }
            // carrega o entries do arquivo como o replacemap
            replaceMap = dataStructure['entries'];
            // carregar os paths base definidos fora do entries
            targetsDir = dataStructure['targets-dir'];
            substitutesDir = dataStructure['substitutes-dir'];
        }
        else {
            console.error(`o resultado da leitura de ${yamlPath} falhou. possivelmente por:\n
                - ser null\n
                - não retornar um objeto\n
                - não possuir 'entries' como uma das chaves`);
        }
    }
    catch (err) {
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
        let aliases = [];
        const getAliases = replaceMap[entry]?.aliases;
        if (getAliases) {
            aliases = getAliases;
        }
        // definir quais vão ser os alvos de substituição finais
        // por padrão, é key + aliases, mas se ignore-key for true, vão ser só os aliases
        let targets = [];
        const ignoreKey = replaceMap[entry]?.['ignore-key'];
        if (!ignoreKey) {
            // além de adicionar o nome da key nos targets, também adicionar os aliases
            targets.push(entry);
            targets.concat(aliases);
        }
        else {
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
//# sourceMappingURL=main.js.map