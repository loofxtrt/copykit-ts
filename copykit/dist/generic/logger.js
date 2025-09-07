import chalk from 'chalk';
function baseLog(level = 'text', msg) {
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
    let extraLines = '';
    if (msg.length > 1) {
        // tira a primeira linha do array, ignorando ela
        const msgLines = msg.slice(1);
        // adicionar uma quebra de linha pra cada string extra
        msgLines.forEach(line => {
            extraLines += line + '\n    ';
        });
    }
    // pintar as linhas extras com a mesma cor do level, mas com um tom mais fraco
    // se não tivesse o color, a cor também poderia ser uma versão mais fraca do texto normal
    extraLines = color.dim(extraLines);
    // imprimir a mensagem do log com ou sem as linhas extras
    if (extraLines.trim() === '') {
        console.log(`[ ${shortLevel} ] ${finalMsg}`);
    }
    else {
        console.log(`[ ${shortLevel} ] ${finalMsg}\n    ${extraLines}`);
    }
}
// wrappers
function success(...msgArray) {
    baseLog('success', msgArray);
}
function error(...msgArray) {
    baseLog('error', msgArray);
}
function info(...msgArray) {
    baseLog('info', msgArray);
}
function warn(...msgArray) {
    baseLog('warn', msgArray);
}
function caught(err) {
    // caso especial pra imprimir errs capturados com catch
    console.error(chalk.red(err));
}
export default {
    success,
    error,
    info,
    warn,
    caught
};
//# sourceMappingURL=logger.js.map