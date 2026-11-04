# Como contribuir

Obrigado por ajudar a tornar o Taskelio útil em mais contextos de trabalho.

Para relatar um problema, descreva o navegador, o tipo de gatilho, o resultado esperado e passos para reproduzir. Use páginas de exemplo ou dados fictícios; não inclua informações de clientes, tokens ou telas privadas de CRM.

Para contribuir com código:

1. Discuta mudanças grandes em uma issue antes de implementar.
2. Mantenha os módulos de contagem independentes de sistemas específicos.
3. Cubra mudanças na contagem e na deduplicação com testes.
4. Rode `npm test`, `npm run check` e, quando alterar a extensão, `npm run test:browser`.
5. Descreva o comportamento alterado e como foi verificado no pull request.

Permissões devem ser mínimas e opcionais por site. Não adicione telemetria, dependências remotas ou captura de conteúdo sem discussão explícita do projeto.
