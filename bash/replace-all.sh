#!/usr/bin/bash

# roda a substituição pra todos os ícones do alvo especificado
# o alvo pode ser o nome de qualquer yaml do map, esse script é só um wrapper pra facilitar a chamada

npx tsc
node copykit/dist/main.js replace $1 -d all # $1 é o argumento passado pro script