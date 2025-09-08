import chalk from 'chalk';

function baseLog(level: string = 'text', msg: string[]) {
    /**
     * imprime mensagens de log no terminal
     * todos os argumentos DESSA função são passados pelas outras subfunções de log
     * 
     * @param level - define o indicador que vai aparecer na frente do conteúdo
     * @param msg - mensagem principal do log
     */

    // definir qual vai ser a cor e alias do level da mensagem baseada no level passado pra func
    // toda versão curta de um level deve ter um número x de caracteres que é igual em todas as ocorrências
    let color;
    let shortLevel;
    switch (level) {
        case 'success':
            color = chalk.green;
            shortLevel = 'okay';
            break;
        case 'error':
            color = chalk.red;
            shortLevel = 'erro';
            break;
        case 'info':
            color = chalk.blue;
            shortLevel = 'info';
            break;
        case 'warn':
            color = chalk.yellow;
            shortLevel = 'warn';
            break;
        case 'init':
            color = chalk.yellow;
            shortLevel = 'init';
            break;
        default:
            color = chalk.reset;
            shortLevel = 'text';
            break;
    }

    // colorir o level e formatar o texto
    shortLevel = shortLevel.toUpperCase();
    shortLevel = color(shortLevel);
    
    // garantir que pelo menos uma linha de mensagem exista
    if (!msg[0]) {
        return;
    }
    const finalMsg = msg[0];
    
    // tratar mais linhas caso o array de mensagens seja maior que um item
    let extraLines: string = '';

    if (msg.length > 1) {
        // tira a primeira linha do array, ignorando ela
        const msgLines: string[] = msg.slice(1);

        // adicionar uma quebra de linha pra cada string extra
        msgLines.forEach(line => {
            extraLines += line + '\n    ';
        });

        // remover a quebra de linha extra do final
        extraLines = extraLines.trimEnd();
    }

    // pintar as linhas extras com a mesma cor do level, mas com um tom mais fraco
    // se não tivesse o color, a cor também poderia ser uma versão mais fraca do texto normal
    extraLines = color.dim(extraLines);

    // imprimir a mensagem do log com ou sem as linhas extras
    if (extraLines.trim() === '') {
        console.log(
            `[ ${ shortLevel } ] ${finalMsg}`
        );
    } else {
        console.log(
            `[ ${ shortLevel } ] ${finalMsg}\n    ${extraLines}`
        );
    }
}

// wrappers
function success(...msgArray: string[]) {
    baseLog('success', msgArray);
}

function error(...msgArray: string[]) {
    baseLog('error', msgArray);
}

function info(...msgArray: string[]) {
    baseLog('info', msgArray);
}

function warn(...msgArray: string[]) {
    baseLog('warn', msgArray);
}

function init(...msgArray: string[]) {
    // log usado pra anunciar quando um processo começa
    baseLog('init', msgArray);
}

function caught(err: any) {
    // caso especial pra imprimir errs capturados com catch
    console.error(chalk.red(err));
}

export default {
    success,
    error,
    info,
    warn,
    init,
    caught
}