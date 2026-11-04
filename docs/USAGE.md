# Como usar o Taskelio

**Português** · [English](USAGE.en.md)

## Idioma

Use **Idioma / Language** no painel ou no popup para escolher **Português** ou **English**. Na primeira abertura, a extensão usa português para navegadores em português e inglês para os demais. Sua escolha fica salva neste perfil do navegador e é compartilhada entre o painel e o popup. Trocar o idioma não altera contadores, valores esperados, regras ou histórico.

O Taskelio é uma extensão de navegador para acompanhar atividades definidas por você. Cada contador representa uma atividade, como leads qualificados, perfis consultados ou tarefas finalizadas.

## 1. Instalar

1. Baixe `taskelio-v0.2.0.zip` nos **Assets** da [versão mais recente](https://github.com/blajeen/taskelio/releases/latest).
2. Extraia os arquivos para uma pasta permanente. Ela precisa conter `manifest.json`.
3. No Chrome, abra `chrome://extensions`. No Edge, abra `edge://extensions`.
4. Ative **Modo do desenvolvedor** e clique em **Carregar sem compactação** / **Carregar expandida**.
5. Selecione a pasta extraída. Não selecione o ZIP.
6. Fixe o Taskelio no menu de extensões. Clique no ícone e em **Abrir meu painel**.

O Taskelio ainda não está nas lojas de extensões. O modo do desenvolvedor permite instalar esta versão do GitHub. Nenhum servidor ou comando é necessário para usar a extensão.

## 2. Criar um contador

Abra uma página do seu sistema em outra aba. No Taskelio, clique em **Novo contador**.

| Campo | O que preencher |
| --- | --- |
| Nome | A atividade: “Leads qualificados”, por exemplo. |
| Site | A origem do sistema, como `https://minhaempresa.exemplo.com`. |
| Caminho | Parte depois do domínio. Use `/person/*` para perfis ou `*` para todo o site. |
| Quando contar? | Mudança de campo, abertura de página ou clique. |
| Elemento observado | Use a seleção visual ou informe um seletor CSS. Não é necessário para visitas. |
| Valor esperado | O valor que representa conclusão, como `Yes` ou `Concluído`. |
| Repetição | Como o mesmo item pode ser contado novamente. |
| Meta diária | Opcional; deixe zero para não usar meta. |

O navegador pedirá autorização para o site. Cada site precisa ser autorizado separadamente. O Taskelio não precisa de acesso a todos os sites para funcionar.

### Selecionar o elemento

1. Preencha **Site** e deixe uma página desse site aberta em outra aba.
2. Clique em **Selecionar na página**.
3. A aba do site será ativada e exibirá uma faixa do Taskelio.
4. Clique no campo ou botão desejado. O clique de seleção não executa a ação do sistema.
5. Volte ao painel. O campo **Elemento observado** estará preenchido.
6. Clique em **Testar elemento** para conferir quantos elementos foram encontrados e o valor atual.

Pressione **Esc** no site para cancelar a seleção. Se várias abas do mesmo site estiverem abertas, a seleção usa a aba ativa desse site ou a acessada mais recentemente. Para evitar confusão, deixe apenas a aba que quer configurar aberta.

Para mudança de campo, prefira um teste que encontre **um único elemento**. Se o teste encontrar vários, a versão inicial observa apenas o primeiro. Selecione o valor em si, em vez de um bloco que também contenha rótulos e outros textos. Se o campo for um checkbox, os valores são `true` e `false`.

## 3. Exemplos

### Campo Qualified mudando para Yes

- Nome: **Leads qualificados**.
- Site: o domínio real do seu CRM.
- Caminho: o caminho das páginas de perfil, por exemplo `/person/*`.
- Gatilho: **Um campo mudar para um valor**.
- Elemento: selecione o campo que mostra o valor de Qualified.
- Valor esperado: **Yes**.
- Repetição: **Uma vez por item, sem repetir**.

Salve a regra com o perfil ainda em `No`. Ao mudar para `Yes`, o contador aumenta. Abrir um perfil que já está em `Yes` não conta como tarefa nova. A regra precisa observar a mudança; se o site navegar imediatamente para outra tela sem mostrar a atualização, ela pode não capturá-la. Este é um exemplo de configuração genérica, não uma integração já validada com o Pipedrive.

### Quantos perfis consultei hoje?

- Nome: **Perfis consultados**.
- Gatilho: **Uma página for aberta**.
- Caminho: apenas o trecho das páginas de perfil.
- Repetição: **Uma vez por item a cada dia**.

Abrir o mesmo perfil várias vezes no dia conta uma vez. No dia seguinte, ele pode contar novamente. Escolha **Cada ocorrência** se quiser contar reaberturas também; há um intervalo mínimo de 1,2 segundo para o mesmo item.

### Clique em Finalizar

- Nome: **Finalizações**.
- Gatilho: **Um elemento receber um clique**.
- Elemento: selecione o botão **Finalizar** do sistema.

Esse contador mede cliques, mesmo que a operação apresente erro depois. Para medir conclusão confirmada, prefira um campo que muda de valor depois do sucesso.

## 4. Como o Taskelio identifica um item

Por padrão, cada endereço é um item: domínio + caminho + fragmento após `#`. Parâmetros após `?` não identificam itens nem entram no caminho da regra. Um sistema que usa apenas `?id=123` para distinguir perfis precisa de identificação adicional.

Em **Identificação do item e repetição**, informe um seletor de elemento que contenha um ID estável. O Taskelio usa primeiro `data-id`, depois `href`, e por fim o valor/texto do elemento. Não selecione textos inteiros com dados pessoais se existir um ID. Se o identificador configurado não estiver disponível, a atividade não será contada.

Esta versão não acompanha várias linhas individualmente na mesma tabela. Para esse cenário, serão necessários recursos adicionais ou conectores. Excel desktop ainda não é suportado.

## 5. Acompanhar e corrigir

- **Visão geral:** total de hoje, total histórico, média e metas por contador.
- **Meus contadores:** edite regras, pause/retome a observação ou exclua um contador.
- **Adicionar 1:** registra uma tarefa manualmente, inclusive em contadores pausados.
- **Histórico → Desfazer:** remove uma contagem dos totais, mantendo o registro da correção.
- **Histórico → Exportar CSV:** baixa todos os registros, inclusive os desfeitos. A tela mostra apenas os últimos 100.

A média considera somente dias com registros válidos. Não é uma média por dias úteis. As datas seguem o fuso do navegador no momento de cada registro. Mudar um campo de volta não desconta automaticamente: use **Desfazer**. Excluir um contador mantém seus registros anteriores no histórico.

## 6. Quando não estiver contando

| Situação | O que verificar |
| --- | --- |
| Nenhuma atividade é registrada | Confira se o contador está ativo, o acesso ao site está autorizado e o caminho corresponde à página. |
| O teste encontra zero elementos | Abra a tela correta, espere o campo carregar e refaça a seleção. |
| O campo já estava concluído | Faça uma transição real para o valor esperado depois de salvar a regra. |
| Um item não conta pela segunda vez | Confira a política de repetição. Pode ser uma duplicação bloqueada corretamente. |
| Todos os perfis parecem ser um item | Confira se os IDs estão apenas nos parâmetros da URL e configure um identificador estável. |
| O site mudou de layout | Edite a regra e selecione novamente o elemento. |
| A regra parou após atualizar a extensão | Recarregue também a aba do sistema de trabalho. |
| O elemento está dentro de um iframe | A versão inicial observa apenas a página principal. |

Se persistir, [abra uma issue](https://github.com/blajeen/taskelio/issues) com dados fictícios e passos para reproduzir. Não publique telas privadas, dados de clientes ou credenciais.

## 7. Dados e atualizações

Seus dados ficam no perfil local do navegador. Não há sincronização entre computadores. Desinstalar a extensão ou apagar o perfil pode remover o histórico e as regras. Exporte o CSV periodicamente; ele é um relatório e não restaura as configurações.

Para atualizar sem desinstalar, extraia a nova versão na mesma pasta e clique em **Recarregar** na página de extensões. Depois, recarregue as abas dos sistemas observados. Os limites e detalhes de privacidade estão no [README](../README.md#privacidade-e-limites).
