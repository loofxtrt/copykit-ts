import path from 'path';
import { handleReplaceMap } from './handle.js';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { normalizeYamlName } from './generic/helpers.js';

const YAML_MAPS_DIR = '/mnt/seagate/workspace/coding/projects/scripts/copykit-ts/maps';
const SUBSTITUTES_ROOT = '/mnt/seagate/symlinks/copykit-data/data/substitutes/';
const PACK_ROOT_LOCAL = '/mnt/seagate/symlinks/kde-user-icons/copycat/';
const PACK_ROOT_REMOTE = '/mnt/seagate/symlinks/copycat-repo/copycat/';

yargs(hideBin(process.argv))
    .command(
        'replace <section>',
        'substitue ícones',
        (yargs) => { // construção dos argumentos e opções
            return yargs
                .positional('section', {
                    describe: `
                        nome da seção a ser afetada pelo replace

                        por exemplo, a seção apps:
                            isso se refere tanto ao nome dos arquivos de map (YAML_MAPS_DIR/apps.yaml)
                            tanto ao nome do subdiretório onde o substituto se encontra (SUBSTITUTES_ROOT/apps)
                        
                        mas isso não se refere aos diretórios do icon pack em si
                        os dois terem o mesmo nome de diretórios reais de um icon pack é só convenção
                        `,
                    type: 'string'
                })
                .option('depth', {
                    describe: 'local/remote, afetar só os ícones locais ou os do repositório',
                    type: 'string',
                    alias: 'd'
                });
        },
        async (argv) => { // chamada de funções
            const section = argv.section;
            const depth = argv.depth;

            if (section) {
                // construir o path do diretório onde os substitutos estão
                const substitutesDir = path.join(SUBSTITUTES_ROOT, section);
                
                // construir o path do mapa yaml
                let map = path.join(YAML_MAPS_DIR, section);
                map = await normalizeYamlName(map);

                // chamar a substituição
                if (!depth) {
                    // substituir tanto a versão local quanto a do repositório
                    await handleReplaceMap(map, PACK_ROOT_LOCAL, substitutesDir);
                    await handleReplaceMap(map, PACK_ROOT_REMOTE, substitutesDir);
                } else {
                    // substituir apenas uma versão do icon pack
                    if (depth === 'remote') {
                        await handleReplaceMap(map, PACK_ROOT_REMOTE, substitutesDir);
                    } else if (depth === 'local') {
                        await handleReplaceMap(map, PACK_ROOT_LOCAL, substitutesDir);
                    }
                }
            }
        }
    )
    // COMANDO AINDA NÃO EXISTENTE
    //.command(
    //    'search <term>',
    //    'pesquisa por ícones que CONTENHAM o termo de pesquisa e os copia pra um diretório',
    //    (yargs) => {
    //        return yargs.positional('term', { describe: 'termo a ser pesquisado', type: 'string' });
    //    }
    //)
    .help()
    .argv;

/*
await handleReplaceMap(
    '/mnt/seagate/workspace/coding/projects/scripts/copykit-ts/maps/test.yaml',
    '/mnt/seagate/workspace/coding/projects/scripts/copykit-ts/testing/targets',
    '/mnt/seagate/workspace/coding/projects/scripts/copykit-ts/testing/substitutes/o-barato'
);
*/