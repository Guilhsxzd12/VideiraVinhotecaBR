# Marcas e origens dos produtos

O catálogo mantém marcas, países e regiões em `catalog_terms`, identificados por
`kind` (`bodega`, `pais`, `regiao`). Cada produto referencia essas entradas em
`products.term_ids`; o trigger `sync_catalog_product` atualiza seus nomes de
exibição. A mesma entrada `bodega` pode estar nos vínculos de qualquer quantidade
de produtos, com países e regiões diferentes.

- `products.country`, `region` e `state` descrevem a origem do vinho.
- `catalog_terms.country` e `country_id`, quando `kind=bodega`, são somente a sede
  informativa e opcional. Não devem filtrar marcas nem preencher a origem.
- Quando `kind=regiao`, o país é obrigatório. O ADM filtra regiões pelo país do
  produto e valida essa associação ao salvar.
- Mudar o país do produto limpa região/estado; mantém a marca selecionada.
- Mudar a marca preserva país, região, estado e uvas do produto.
- `grape` preserva a composição informada (inclusive percentuais); várias uvas
  podem ser adicionadas no editor. `grape_is_blend` mantém o editor de composição.

A revisão não exigiu migração de estrutura ou alteração de cadastros: o bloqueio
estava no filtro e autopreenchimento do ADM e na validação de sede obrigatória.
Um teste transacional no Supabase confirmou a mesma marca em três produtos de
duas origens, inclusive após alterar sua sede; todas as inclusões foram revertidas.
As políticas de RLS e os identificadores existentes foram preservados.
