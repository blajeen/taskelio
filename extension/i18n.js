// Keep both translations together so a UI message cannot silently miss a language.
export const messages = {
  title: ['Taskelio · Seu trabalho, contado', 'Taskelio · Your work, counted'],
  workspace: ['SEU ESPAÇO DE TRABALHO', 'YOUR WORKSPACE'],
  overview: ['Visão geral', 'Overview'], rules: ['Meus contadores', 'My counters'], history: ['Histórico', 'History'],
  localHeading: ['Fica no seu navegador.', 'Stays in your browser.'],
  localDescription: ['Seus números são seus. Sem conta, servidor ou envio de dados.', 'Your numbers belong to you. No account, server or data uploads.'],
  version: ['VERSÃO 0.2 · OPEN SOURCE', 'VERSION 0.2 · OPEN SOURCE'],
  yourSpace: ['Seu espaço /', 'Your workspace /'], storage: ['Armazenamento local', 'Local storage'], language: ['Idioma', 'Language'],
  overviewTitle: ['Cada tarefa conta.', 'Every task counts.'],
  overviewDescription: ['Cuide do trabalho. A gente cuida da contagem.', 'Focus on your work. We’ll handle the counting.'],
  rulesTitle: ['Seu trabalho, suas regras.', 'Your work, your rules.'],
  rulesDescription: ['Configure os sinais que representam uma tarefa feita.', 'Choose the signals that mean a task is done.'],
  historyTitle: ['Um registro de cada passo.', 'A record of every step.'],
  historyDescription: ['Acompanhe o que foi contado e ajuste quando precisar.', 'Review what was counted and make corrections when needed.'],
  newCounter: ['＋ Novo contador', '＋ New counter'], todayTasks: ['Tarefas hoje', 'Tasks today'],
  oneStep: ['Um passo de cada vez.', 'One step at a time.'], totalRecorded: ['Total registrado', 'Total recorded'],
  sinceFirst: ['Desde o seu primeiro registro', 'Since your first recorded task'], average: ['Média por dia ativo', 'Average per active day'],
  activeDays: ['Considera dias com registros', 'Includes days with recorded tasks'], yourCounters: ['Seus contadores', 'Your counters'],
  yourMeasure: ['Um jeito seu de medir o trabalho', 'Your own way to measure your work'],
  defineCount: ['Você define o que conta.', 'You decide what counts.'],
  defineDescription: ['Uma página aberta, um clique ou um campo atualizado. Crie uma regra e deixe o Taskelio acompanhar.', 'A page opened, a click or an updated field. Create a rule and let Taskelio keep track.'],
  createRule: ['Criar minha regra →', 'Create my rule →'], activities: ['Atividades registradas', 'Recorded activities'], export: ['↓ Exportar CSV', '↓ Export CSV'],
  historyLimit: ['Últimos 100 registros. A exportação inclui o histórico completo, inclusive correções.', 'Latest 100 records. Exports include the full history, including corrections.'],
  counter: ['Contador', 'Counter'], dateTime: ['Data e hora', 'Date and time'], source: ['Origem', 'Source'], action: ['Ação', 'Action'],
  footer: ['Menos contagem. Mais foco.', 'Less counting. More focus.'], footerBrand: ['taskelio · feito para o seu dia a dia', 'taskelio · made for your everyday work'],
  yourWay: ['DO SEU JEITO', 'YOUR WAY'], dialogNew: ['Novo contador', 'New counter'], dialogEdit: ['Editar contador', 'Edit counter'], close: ['Fechar', 'Close'],
  dialogDescription: ['Escolha onde acontece e o que significa uma tarefa feita.', 'Choose where it happens and what a completed task means.'],
  name: ['Nome do contador', 'Counter name'], namePlaceholder: ['Ex.: Leads qualificados', 'e.g. Qualified leads'],
  site: ['Site', 'Website'], sitePlaceholder: ['https://sua-empresa.pipedrive.com', 'https://your-company.pipedrive.com'], path: ['Caminho da página', 'Page path'],
  pathHint: ['Use * para qualquer trecho. Ex.: /person/* ou /app#/contacts/*. Parâmetros após ? não entram na regra.', 'Use * to match any text. For example: /person/* or /app#/contacts/*. Query parameters after ? are not matched.'],
  when: ['Quando contar?', 'When should it count?'],
  triggerField: ['Um campo mudar para um valor', 'A field changes to a value'], triggerVisit: ['Uma página for aberta', 'A page is opened'], triggerClick: ['Um elemento receber um clique', 'An element is clicked'],
  element: ['Elemento observado', 'Watched element'], selector: ['seletor CSS', 'CSS selector'],
  elementPlaceholder: ['Ex.: [data-testid="qualified"]', 'e.g. [data-testid="qualified"]'],
  pick: ['⌖ Selecionar na página', '⌖ Select on page'], test: ['Testar elemento', 'Test element'],
  pickHint: ['Abra a página do site em outra aba. A seleção visual não executa o clique no sistema.', 'Open the website in another tab. Selecting an element does not click it in your system.'],
  expected: ['Valor esperado', 'Expected value'], expectedPlaceholder: ['Ex.: Yes', 'e.g. Yes'],
  identitySummary: ['Identificação do item e repetição', 'Item identity and repeat counting'],
  repeatQuestion: ['Como evitar repetições?', 'How should repeats be handled?'], daily: ['Uma vez por item a cada dia', 'Once per item each day'],
  once: ['Uma vez por item, sem repetir', 'Once per item, ever'], always: ['Cada ocorrência (intervalo mínimo de 1,2 s)', 'Every occurrence (at least 1.2 s apart)'],
  identity: ['Elemento com o identificador do item', 'Element containing the item ID'], optional: ['opcional', 'optional'],
  identityPlaceholder: ['Ex.: [data-id]', 'e.g. [data-id]'],
  identityHint: ['Por padrão, cada endereço (caminho + #) é um item, sem parâmetros de busca. Para várias linhas na mesma página ou IDs no parâmetro da URL, configure um identificador estável. O elemento usa data-id, href ou seu valor/texto.', 'By default, each address (path + #) is one item, excluding query parameters. Configure a stable ID for items on the same page or IDs in URL query parameters. The element uses data-id, href or its value/text.'],
  goal: ['Meta diária', 'Daily goal'], cancel: ['Cancelar', 'Cancel'], save: ['Salvar contador', 'Save counter'],
  noteField: ['Conta quando o valor observado muda para o esperado. Um campo já preenchido ao abrir a página não conta como trabalho novo. A comparação ignora maiúsculas e espaços extras.', 'Counts when the watched value changes to the expected value. A field already set when you open the page does not count as new work. Matching ignores case and extra spaces.'],
  noteVisit: ['Conta ao abrir uma página ou navegar para outro endereço dentro do site. Use um caminho específico para evitar contar páginas que não são perfis.', 'Counts when you open a page or navigate to another address on the website. Use a specific path to avoid counting pages that are not profiles.'],
  noteClick: ['Conta a intenção do clique. Para contar apenas tarefas concluídas, prefira observar uma mudança de campo ou uma mensagem de confirmação.', 'Counts the click attempt. To measure completed tasks, prefer watching a field change or confirmation message.'],
  visit: ['Página aberta', 'Page opened'], click: ['Clique em elemento', 'Element clicked'], field: ['Mudança de campo', 'Field changed'],
  active: ['Ativo', 'Active'], paused: ['Pausado', 'Paused'], today: ['hoje', 'today'],
  goalLabel: ['Meta: {goal} por dia', 'Goal: {goal} per day'], totalLabel: ['{total} no total', '{total} in total'], noGoal: ['Sem meta diária', 'No daily goal'],
  add: ['＋ Adicionar 1', '＋ Add 1'], edit: ['Editar', 'Edit'], pause: ['Pausar', 'Pause'], resume: ['Retomar', 'Resume'], delete: ['Excluir', 'Delete'],
  emptyHeading: ['O primeiro passo é seu.', 'Your first step starts here.'],
  emptyDescription: ['Crie um contador para algo que você faz todos os dias. O Taskelio acompanha as próximas tarefas por você.', 'Create a counter for something you do every day. Taskelio will keep track of your next tasks.'],
  emptyCreate: ['＋ Criar meu primeiro contador', '＋ Create my first counter'],
  manual: ['Manual', 'Manual'], automatic: ['Automático', 'Automatic'], undone: ['Desfeito', 'Undone'], undo: ['Desfazer', 'Undo'],
  historyEmpty: ['Seu histórico começa com a primeira tarefa registrada.', 'Your history starts with your first recorded task.'],
  saved: ['Contador salvo. As próximas atividades já podem contar.', 'Counter saved. Your next activities can now be counted.'],
  pickInstruction: ['Clique no elemento na aba do site e depois volte a este painel.', 'Click the element in the website tab, then return to this dashboard.'],
  testCount: ['{count} elemento(s) encontrado(s).', '{count} element(s) found.'],
  currentValue: [' Valor atual: “{value}”.', ' Current value: “{value}”.'],
  adjustSelector: [' Ajuste o seletor ou abra a página correta.', ' Adjust the selector or open the correct page.'],
  testNoCount: [' Este teste não adiciona contagens.', ' This test does not add counts.'],
  picked: ['Elemento selecionado. Valor atual: “{value}”. Ajuste o valor esperado e teste antes de salvar.', 'Element selected. Current value: “{value}”. Set the expected value and test before saving.'],
  added: ['1 tarefa adicionada. Você pode desfazer no histórico.', '1 task added. You can undo it in History.'], undoToast: ['Contagem desfeita.', 'Count undone.'],
  deleteConfirm: ['Excluir este contador? Os registros anteriores continuarão no histórico.', 'Delete this counter? Previous records will remain in your history.'],
  popupDay: ['SEU DIA ATÉ AQUI', 'YOUR DAY SO FAR'], popupToday: ['tarefas feitas hoje', 'tasks done today'], popupLocal: ['LOCAL', 'LOCAL'],
  popupOpen: ['Abrir meu painel ↗', 'Open my dashboard ↗'],
  popupEmpty: ['Seu primeiro contador começa no painel. Escolha o que conta como trabalho feito para você.', 'Your first counter starts in the dashboard. Choose what counts as completed work for you.'],
  ERR_ACTION: ['Não foi possível completar a ação.', 'Could not complete the action.'],
  ERR_ORIGIN: ['Use um endereço HTTP ou HTTPS.', 'Use an HTTP or HTTPS address.'],
  ERR_NAME: ['Dê um nome ao contador.', 'Give your counter a name.'], ERR_TRIGGER: ['Gatilho inválido.', 'Invalid trigger.'], ERR_DEDUP: ['Repetição inválida.', 'Invalid repeat policy.'],
  ERR_ELEMENT: ['Selecione um elemento da página.', 'Select an element on the page.'], ERR_VALUE: ['Informe o valor que deve ser reconhecido.', 'Enter the value to match.'],
  ERR_GOAL: ['A meta deve ser um número inteiro positivo ou zero.', 'The goal must be a nonnegative whole number up to 1,000,000.'],
  ERR_PATH: ['O caminho deve começar com / ou ser *.', 'The path must start with / or be *.'],
  ERR_IDENTITY: ['Não foi possível identificar o item.', 'Could not identify the item.'],
  ERR_SELECTION: ['Seleção inválida.', 'Invalid selection.'], ERR_UNAUTHORIZED: ['Site não autorizado.', 'Website access is not authorized.'],
  ERR_SELECTOR: ['O seletor CSS informado é inválido.', 'The CSS selector is invalid.'],
  ERR_SOURCE: ['Origem de atividade inválida.', 'Invalid activity source.'], ERR_IDENTIFIER: ['Identificador inválido.', 'Invalid item identifier.'],
  ERR_PANEL: ['Ação disponível somente no painel do Taskelio.', 'This action is only available in the Taskelio dashboard.'],
  ERR_PERMISSION: ['Autorize o acesso ao site antes de salvar.', 'Allow access to the website before saving.'], ERR_COUNTER: ['Contador não encontrado.', 'Counter not found.'],
  ERR_UNKNOWN: ['Ação desconhecida.', 'Unknown action.'], ERR_TAB: ['Abra uma página desse site em outra aba primeiro.', 'Open a page from that website in another tab first.'],
  ERR_GRANT: ['O site precisa ser autorizado para a regra funcionar.', 'Website access must be allowed for this rule to work.'],
  ERR_URL: ['Informe um endereço de site válido.', 'Enter a valid website address.']
};

export function resolveLanguage(preference, browserLanguage = globalThis.navigator?.language || 'en') {
  if (preference === 'pt-BR' || preference === 'en') return preference;
  return browserLanguage.toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}
export let language = resolveLanguage();
export function t(key, params = {}) {
  const message = messages[key]?.[language === 'pt-BR' ? 0 : 1];
  if (message === undefined) throw new Error(`Missing translation: ${key}`);
  return message.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}
export async function initLanguage() {
  const settings = await chrome.storage.local.get('language');
  language = resolveLanguage(settings.language);
}
export async function setLanguage(value) {
  if (!['pt-BR', 'en'].includes(value)) throw new Error('Unsupported language');
  await chrome.storage.local.set({ language: value });
  language = value;
}
export function applyTranslations(root = document) {
  root.documentElement.lang = language;
  for (const element of root.querySelectorAll('[data-i18n]')) element.textContent = t(element.dataset.i18n);
  for (const attribute of ['placeholder', 'aria-label']) {
    for (const element of root.querySelectorAll(`[data-i18n-${attribute}]`)) element.setAttribute(attribute, t(element.getAttribute(`data-i18n-${attribute}`)));
  }
  const select = root.querySelector('#language');
  if (select) select.value = language;
}
export function errorMessage(error) {
  const key = error?.message || 'ERR_ACTION';
  if (messages[key]) return t(key);
  if (error?.name === 'TypeError' && /url/i.test(key)) return t('ERR_URL');
  return key;
}
