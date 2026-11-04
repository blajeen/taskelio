# Arquitetura

## Fluxo

`Página → observador genérico → atividade → serviço de fundo → núcleo de contagem → armazenamento local → painel/popup`

`core.js` contém validação de regras, correspondência de URL, deduplicação, calendário local, estatísticas e CSV. É um módulo independente das APIs do navegador, testável com Node.

`background.js` é o único responsável por gravar o estado. Uma fila serial evita perda de eventos e corridas entre abas. Confere a origem e a regra, transforma o identificador em hash e só confirma a contagem após persistir. O armazenamento não é exposto diretamente aos content scripts.

`content.js` é o primeiro produtor de atividades: observa DOM, eventos de formulário, cliques reais e navegação. Um script por documento acompanha apenas o frame principal. Atualizações de regras reiniciam a referência dos campos, sem contar o estado atual como uma mudança. `picker.js` seleciona elementos sem executar o clique no sistema.

`app.js` e `popup.js` usam mensagens para leituras e alterações. O painel pede permissão por origem por meio de uma ação explícita do usuário; o serviço registra o observador somente para sites autorizados.

## Modelo v1

Estado: `{ version: 1, rules: Rule[], events: Event[] }`.

Regra: `{ id, name, origin, path, trigger, selector, value, identitySelector, dedup, goal, enabled, createdAt }`.

Atividade interna: `{ type: 'ACTIVITY', ruleId, url, entity }`. A URL valida o escopo, e `entity` existe apenas em trânsito local, sendo transformado em hash antes de persistir. O identificador não deve conter texto de uma linha inteira se existir um ID estável.

Evento persistido: `{ id, ruleId, ruleName, at, day, entityKey, source, undone }`.

Regras excluídas não apagam eventos; eventos preservam o nome no momento da contagem. Correções marcam `undone`, preservando o registro. A atividade manual não interfere na deduplicação automática.

## Conectores futuros

O produtor de atividades e o núcleo estão separados para permitir conectores. O protocolo atual é interno e ainda não é uma API pública de plugins. Um conector deverá identificar o escopo, capturar uma conclusão e produzir um identificador estável; deduplicação e histórico continuarão centralizados. Integrações externas precisarão de autenticação e um limite de confiança próprios antes de usar o mesmo fluxo.

Não há permissões de comunicação externa nem execução de código de modelos de regras. Modelos futuros devem ser declarativos e validados; não devem executar JavaScript fornecido por terceiros.
