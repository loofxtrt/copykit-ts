#!/usr/bin/bash

# mesma coisa do replace-all, mas só pro local

npx tsc
node copykit/dist/main.js replace $1 -d local # $1 é o argumento passado pro script