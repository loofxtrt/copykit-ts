pra baixar as dependências  
`npm i`  
  
pra compilar e rodar o main direto  
`npm run dev`  
  
pra compilar e chamar o script  
`npx tsc`  
`node copykit/dist/main.js (comando) (argumentos e opções)`  
  
> [!IMPORTANT]  
> os arquivos `.yaml` do `./maps` devem ter os mesmos nomes que os subdiretórios que contém seus respectivos substitutos  
> isso é importante pra quando for o argumento `section` do script  
>  
> se a section fosse `apps`    
> o subdir seria: `/mnt/seagate/symlinks/copykit-data/data/substitutes/apps`  
> e o .yaml seria: `apps.yaml`