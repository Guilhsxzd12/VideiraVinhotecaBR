# Videira Vinhoteca

Loja em Next.js com identidade Videira, inspirada na organização comercial da Cia do Vinho: busca em destaque, navegação por estilos, banner com seleções, vitrines, descoberta por país, uva, produtor e faixa de preço.

## Executar

```sh
npm ci
npm run dev
```

Produção: `npm run build`, depois `npm start`.

O build usa geração estática sequencial para evitar falhas de criação de diretórios durante compilações paralelas no Windows.

## Rotas

- `/`: página inicial.
- `/loja`: catálogo com pesquisa, tipo, país, uva, bodega, faixa de preço e ordenação.
- `/vinho?produto=slug--id` e `/vinho/[id]`: detalhes, informações técnicas e produtos relacionados.
- `/adm`: painel administrativo existente.
- `/politicas`: informações institucionais existentes.

O carrinho conserva sua seleção entre páginas e prepara o pedido no WhatsApp da Videira. Frete e condições são confirmados no atendimento.

## Catálogo

A integração de dados existente está em `app/catalogLoader.js`. O endereço Supabase configurado originalmente, `rmyybeaepscmzbddnvzr.supabase.co`, não respondeu no DNS durante a verificação. Conforme decisão do proprietário, sua configuração será corrigida em uma próxima etapa. Produtos, preços e banco de dados não foram alterados por este redesign.

O visual foi testado com respostas de API sintéticas exclusivamente no ambiente local, sem adicionar produtos de demonstração ao site. Enquanto o backend estiver indisponível, a loja mostra um aviso de falha e permite tentar novamente.

## Hospedagem

`vercel.json` usa o framework Next.js deste repositório. Foi removido o redirecionamento integral que antes enviava as páginas para outro projeto.
