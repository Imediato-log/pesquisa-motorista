/* ============================================================================
   questoes.js · Pesquisa do Motorista v2 (Imediato)

   ÚNICA FONTE das perguntas: textos, opções e condições.
   - A página (index.html) desenha as telas a partir daqui.
   - O Coletor.gs recebe uma cópia das listas permitidas, gerada por
     ferramentas/gerar.js. Depois de mudar QUALQUER opção aqui, rode:
         node ferramentas/gerar.js
     e cole de novo o Coletor.gs no Apps Script.

   Textos que dá para editar sem medo: titulo, legenda, apoio.
   Cuidado: mudar o TEXTO de uma opção muda o que chega na planilha.
   ============================================================================ */
var QUESTOES = (function () {
  var VERSAO = 'v2.2-2027-01';
  var NAO_ESTA = 'Não está na lista';
  var SEM_PROBLEMA = 'Não tenho nenhum problema hoje';
  var PAG_ABERTO = 'Sim, e ainda não foi resolvido';
  /* Só existe no modo anônimo. */
  var PREFIRO_NAO = 'Prefiro não informar';
  var AVISO_TEXTO = 'Não escreva nome, placa ou algo que identifique você.';
  function anonimo(A) { return A.modo === 'anonimo'; }
  function maisPrefiro(lista, A) { return anonimo(A) ? lista.concat([PREFIRO_NAO]) : lista; }

  var OPERACOES = ['XD - Cross', 'FF - Full', 'Last'];
  var NOME_LIDER = { 'XD - Cross': 'XD', 'FF - Full': 'Full', 'Last': 'Last' };
  var NOTA_ROTULOS = ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Ótimo'];

  /* Todos os estados, só para quem digita uma cidade que "Não está na lista". */
  var ESTADOS_BR = ['Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás',
                    'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco',
                    'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima',
                    'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'];

  /* Cidades por operação e estado. Sem o código do HUB (de propósito): o HUB se cruza depois pela placa.
     Onde dois HUBs ficam na mesma cidade (ex.: Extrema, São Carlos) aparece uma cidade só. */
  var CIDADES = {
    'XD - Cross': {
      'Goiás': ['Goiânia'],
      'Mato Grosso do Sul': ['Campo Grande'],
      'Minas Gerais': ['Contagem', 'Pouso Alegre', 'Uberlândia'],
      'Paraná': ['Araucária', 'Londrina', 'Maringá'],
      'São Paulo': ['Bauru', 'Campinas', 'Cravinhos', 'Guarulhos', 'Marília', 'Presidente Prudente']
    },
    'FF - Full': {
      'Espírito Santo': ['Serra'],
      'Minas Gerais': ['Betim', 'Extrema', 'Ipatinga', 'Juiz de Fora', 'Pouso Alegre', 'Uberlândia'],
      'Rio de Janeiro': ['Queimados'],
      'São Paulo': ['Araçariguama', 'Embu das Artes', 'Franco da Rocha', 'Guarulhos', 'Itupeva', 'Perus',
                    'Presidente Prudente', 'São Carlos', 'Sumaré']
    },
    'Last': {
      'Distrito Federal': ['Brasília'],
      'Minas Gerais': ['Contagem'],
      'Paraná': ['Campina Grande do Sul', 'Cascavel', 'Curitiba'],
      'Santa Catarina': ['Itajaí', 'Joinville'],
      'São Paulo': ['Bauru', 'Cravinhos', 'Franca', 'Ribeirão Preto', 'São Carlos']
    }
  };
  function ufsDa(A) { return Object.keys(CIDADES[A.operacao] || {}); }
  function cidadesDa(A) { return ((CIDADES[A.operacao] || {})[A.estado]) || []; }

  var AREAS = [
    { id: 'escala', nome: 'Escala', apoio: 'quem monta suas rotas: horários, paradas, KM e quantidade de rotas' },
    { id: 'monitoramento', nome: 'Monitoramento', apoio: 'quem acompanha você durante a rota' },
    { id: 'financeiro', nome: 'Financeiro', apoio: 'frete, espelho, pagamento e tratativas' },
    { id: 'operacional', nome: 'Operacional', apoio: 'descarga, coleta e organização no HUB' },
    { id: 'lideranca', nome: 'Liderança da operação', apoio: 'a gestão do Full, do XD ou do Last' }
  ];

  /* Problemas por área. "Não está na lista" é acrescentado no fim de cada uma. */
  var PROBLEMAS = {
    escala: ['Poucas rotas na semana', 'Horários ruins', 'Muitas paradas na rota', 'KM da rota diferente do real',
             'Deslocamento longo até a rota', 'Rota alterada em cima da hora', 'Apoio em coleta fora do planejado'],
    monitoramento: ['Demora para responder', 'Difícil conseguir falar com eles', 'Orientação confusa ou errada',
                    'Falta de apoio quando dá problema na rota'],
    financeiro: ['Valor do frete abaixo do mercado', 'Apoio ou deslocamento feito e não pago',
                 'Pedi o espelho e demorou para chegar', 'Pedi o espelho e não recebi', 'Não sei como pedir o espelho',
                 'Pagamento atrasado', 'Valor pago diferente do combinado ou desconto indevido',
                 'Demora para resolver minha tratativa', 'Não entendo como meu pagamento é calculado'],
    operacional: {
      base: ['Espera longa para descarregar', 'Descarga desorganizada', 'Coleta demorada'],
      Last: ['Espera longa para coletar', 'Coleta desorganizada']
    },
    lideranca: ['Não dá retorno sobre o que eu levo', 'Pouco contato, não sei quem é meu líder',
                'Decisões mudam sem explicação', 'Tratamento sem respeito',
                'Forma de recebimento (cartão, transferência)']
  };

  var ESPERA = {
    descarga: {
      titulo: 'Em média, quanto tempo você espera no HUB para descarregar?',
      legenda: 'Da hora em que chega até começar a descarregar.',
      opcoes: ['Até 30 min', 'De 30 min a 1 h', 'De 1 a 2 h', 'Mais de 2 h', 'Não descarrego no HUB']
    },
    coleta: {
      titulo: 'Em média, quanto tempo você espera no HUB para fazer a coleta?',
      legenda: 'Da hora em que chega até começar a coletar.',
      opcoes: ['Até 30 min', 'De 30 min a 1 h', 'De 1 a 2 h', 'Mais de 2 h', 'Não coleto no HUB']
    }
  };

  var LISTAS = {
    tempo_casa: ['Menos de 3 meses', 'De 3 meses a 1 ano', 'De 1 a 2 anos', 'Mais de 2 anos'],
    exclusivo: ['Só com a Imediato', 'Também com outras empresas'],
    frete: ['Muito abaixo', 'Abaixo', 'Na média', 'Acima', 'Muito acima', 'Não sei avaliar'],
    pagamento: ['Não', 'Sim, e foi resolvido rapidamente', 'Sim, mas demorou para ser resolvido', PAG_ABERTO],
    pag_tempo: ['Menos de 15 dias', 'De 15 a 30 dias', 'Mais de 30 dias'],
    pag_protocolo: ['Sim', 'Não', 'Não sei o que é protocolo'],
    resolucao: ['Sempre', 'Na maioria das vezes', 'Às vezes', 'Raramente', 'Nunca', 'Nunca precisei solicitar'],
    intencao: ['Com certeza continuarei', 'Provavelmente continuarei', 'Ainda não sei',
               'Provavelmente não continuarei', 'Com certeza não continuarei'],
    motivo: ['Valor do frete', 'Apoios e deslocamentos não pagos', 'Erro ou atraso no pagamento',
             'Poucas rotas ou horários ruins (Escala)', 'Espera na descarga ou coleta', 'Liderança da operação',
             'Monitoramento', 'Motivo pessoal', NAO_ESTA],
    canais: ['Conheço e já usei', 'Conheço, mas nunca usei', 'Não conheço'],
    origem: ['Visita da equipe no HUB', 'Pelo líder da minha operação', 'Mensagem no WhatsApp', 'De outro jeito'],
    assuntos: ['Pagamento, espelho ou tratativa', 'Escala (rotas e horários)', 'Monitoramento',
               'Operacional (descarga e coleta)', 'Liderança da operação', 'Outro assunto']
  };

  /* Quem responde "Ainda não sei" ou pior está em risco (mesma regra de agosto). */
  var INTENCAO_RISCO = ['Ainda não sei', 'Provavelmente não continuarei', 'Com certeza não continuarei'];
  var INTENCAO_FIRME = ['Com certeza continuarei', 'Provavelmente continuarei'];

  var NOTAS = {
    op: [
      { k: 'escala', t: 'Escala: planejamento das rotas e horários' },
      { k: 'monitoramento', t: 'Monitoramento: atendimento durante a rota' },
      { k: 'comunicacao', t: 'Informações sobre coletas, mudanças de rota e procedimentos chegam claras e com antecedência' },
      { k: 'lideranca_op', t: function (A) { return 'Liderança do ' + (NOME_LIDER[A.operacao] || 'operação'); } }
    ],
    fin: [
      { k: 'fin_tratativas', t: 'Atendimento quando você abre uma tratativa (dúvida, divergência, reclamação)' },
      { k: 'fin_espelho', t: 'Quando você pede o espelho, ele chega rápido' },
      { k: 'fin_entendimento', t: 'Entender como o seu pagamento é calculado' },
      { k: 'fin_pag_data', t: 'O pagamento cai na data combinada' }
    ]
  };

  function tipoEspera(A) { return A.operacao === 'Last' ? 'coleta' : 'descarga'; }
  function problemasDa(areaId, A) {
    if (areaId === 'operacional') {
      var o = PROBLEMAS.operacional;
      return (A && A.operacao === 'Last') ? o.Last : o.base;
    }
    return PROBLEMAS[areaId];
  }
  function marcou(A, id) { return (A.areas || []).indexOf(id) >= 0; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ------------------------------ TELAS (ordem do fluxo) ------------------------------ */
  var TELAS = [
    { id: 'abertura', tipo: 'abertura',
      titulo: 'Olá! Sua opinião ajuda a melhorar o seu dia a dia na operação.',
      legenda: 'São perguntas rápidas, uma por tela. Suas respostas não mudam a sua avaliação como agregado.',
      pergunta_modo: 'Como você quer responder?',
      ja_respondeu: 'Você já respondeu por este celular. Quer responder de novo?',
      modos: [
        { id: 'identificado', nome: 'Responder com identificação', apoio: 'Pedimos a placa. Assim conseguimos dar retorno sobre o seu problema.' },
        { id: 'anonimo', nome: 'Responder anônimo', apoio: 'Não pedimos placa nem telefone. Não dá para darmos retorno individual.' }
      ] },
    { id: 'ident', tipo: 'ident',
      titulo: 'Em qual operação você roda?',
      legenda: 'Se roda em mais de uma operação, escolha a que você mais faz.',
      nota_anonimo: 'Esta pesquisa é anônima: não pedimos placa, nome nem telefone.',
      estado_rotulo: function (A) { return A.operacao === 'Last' ? 'Em qual estado você faz a coleta?' : 'Em qual estado você descarrega?'; },
      estado_vazio: 'Escolha o estado',
      cidade_rotulo: function (A) { return A.operacao === 'Last' ? 'Em qual cidade você faz a coleta?' : 'Em qual cidade você descarrega?'; },
      cidade_vazio: 'Escolha a cidade',
      cidade_digite: 'Escreva a cidade', estado_livre_rotulo: 'Estado dessa cidade' },
    { id: 'placa', tipo: 'placa',
      se: function (A) { return !anonimo(A); },
      titulo: 'Qual a placa que você mais usa com a gente?',
      legenda: 'Só letras e números, sem traço. Ex.: ABC1D23' },
    { id: 'tempo_casa', tipo: 'unica', campo: 'tempo_casa',
      titulo: 'Há quanto tempo você roda com a Imediato?', opcoes: function (A) { return maisPrefiro(LISTAS.tempo_casa, A); } },
    { id: 'exclusivo', tipo: 'unica', campo: 'exclusivo',
      titulo: 'Hoje você roda só com a Imediato?',
      legenda: 'Vale qualquer outra empresa de entrega ou transporte.', opcoes: LISTAS.exclusivo },
    { id: 'nps', tipo: 'nps', campo: 'nps',
      titulo: 'De 0 a 10, o quanto você recomendaria a Imediato como uma boa empresa para trabalhar como agregado?',
      ponta0: '0 · Não recomendaria', ponta10: '10 · Com certeza' },
    { id: 'notas_op', tipo: 'grade', grupo: 'op',
      titulo: 'Operação: dê uma nota de 1 a 5',
      legenda: 'Pense nos últimos 30 dias. 1 = Muito ruim · 3 = Regular · 5 = Ótimo', linhas: NOTAS.op },
    { id: 'notas_fin', tipo: 'grade', grupo: 'fin',
      titulo: 'Financeiro: dê uma nota de 1 a 5',
      legenda: 'Pense nos últimos 30 dias. 1 = Muito ruim · 3 = Regular · 5 = Ótimo', linhas: NOTAS.fin },
    { id: 'frete', tipo: 'unica', campo: 'frete',
      titulo: 'Comparando com outras empresas, o valor do nosso frete está:',
      legenda: 'Só o valor que você recebe pelas rotas. Prazo e espelho ficaram na tela anterior.',
      opcoes: LISTAS.frete },
    { id: 'areas', tipo: 'areas',
      titulo: 'Hoje, em quais áreas você tem algum problema ou algo que ainda não foi resolvido?',
      legenda: 'Pode marcar mais de uma. Vale problema que se repete ou que ficou sem solução.' }
  ]
  .concat(AREAS.map(function (a) {
    return { id: 'prob_' + a.id, tipo: 'multi_prob', area: a.id,
      titulo: a.nome + ': o que está acontecendo?',
      legenda: cap(a.apoio) + '. Pode marcar mais de um.',
      se: function (A) { return marcou(A, a.id); } };
  }))
  .concat([
    { id: 'area_principal', tipo: 'area_principal',
      titulo: 'Dessas áreas, qual mais te atrapalha hoje?',
      se: function (A) { return (A.areas || []).length >= 2; } },
    { id: 'pagamento', tipo: 'unica', campo: 'pagamento',
      titulo: 'Você já teve algum problema com pagamento, desconto ou valor recebido?',
      legenda: 'Valor errado, desconto, atraso ou pagamento que não caiu.', opcoes: LISTAS.pagamento },
    { id: 'pag_tempo', tipo: 'unica', campo: 'pag_tempo',
      titulo: 'Há quanto tempo esse problema está em aberto?', opcoes: LISTAS.pag_tempo,
      se: function (A) { return A.pagamento === PAG_ABERTO; } },
    { id: 'pag_protocolo', tipo: 'unica', campo: 'pag_protocolo',
      titulo: 'Você tem o número de protocolo desse caso?',
      legenda: 'É o número que o Financeiro passa quando você abre a tratativa.', opcoes: LISTAS.pag_protocolo,
      se: function (A) { return A.pagamento === PAG_ABERTO; } },
    { id: 'resolucao', tipo: 'unica', campo: 'resolucao',
      titulo: 'Quando você apresenta um problema ou dificuldade para a Imediato, com que frequência ele é resolvido?',
      legenda: 'Vale para qualquer área: Escala, Monitoramento, Financeiro ou liderança.', opcoes: LISTAS.resolucao },
    { id: 'dias', tipo: 'dias',
      titulo: 'Na semana, quantos dias você roda com a gente?',
      rotulo_roda: 'Rodo hoje', rotulo_gostaria: 'Gostaria de rodar', padrao_roda: 4, padrao_gostaria: 5 },
    { id: 'espera', tipo: 'unica', campo: 'espera',
      titulo: function (A) { return ESPERA[tipoEspera(A)].titulo; },
      legenda: function (A) { return ESPERA[tipoEspera(A)].legenda; },
      opcoes: function (A) { return ESPERA[tipoEspera(A)].opcoes; } },
    { id: 'intencao', tipo: 'unica', campo: 'intencao',
      titulo: 'Pensando nos próximos 6 meses, qual é a sua intenção de continuar operando conosco?',
      opcoes: LISTAS.intencao },
    /* O motivo de saída aparece para TODOS, inclusive para quem pretende continuar (de propósito). */
    { id: 'motivo', tipo: 'unica', campo: 'motivo', texto_se_nao_esta: 'motivo_texto',
      titulo: 'O que mais pesaria para você deixar de rodar com a gente?',
      legenda: function (A) {
        return INTENCAO_FIRME.indexOf(A.intencao) >= 0
          ? 'Mesmo que você pretenda continuar, o que pesaria se um dia pensasse em sair?' : '';
      },
      opcoes: LISTAS.motivo },
    { id: 'canais', tipo: 'unica', campo: 'canais',
      titulo: 'Você conhece a Experiência do Motorista e os canais oficiais de atendimento?',
      opcoes: LISTAS.canais },
    { id: 'origem', tipo: 'unica', campo: 'origem',
      titulo: 'Como você ficou sabendo desta pesquisa?', opcoes: LISTAS.origem },
    { id: 'melhoria', tipo: 'texto', campo: 'melhoria',
      titulo: 'Como a Imediato poderia melhorar sua experiência?', legenda: 'Opcional.', max: 500 },
    { id: 'retorno', tipo: 'retorno',
      se: function (A) { return !anonimo(A); },
      titulo: 'Quer que a gente retorne para você?',
      assunto_titulo: 'Sobre qual assunto?', assunto_vazio: 'Escolha',
      detalhe_titulo: 'Conte em poucas palavras o que aconteceu', detalhe_min: 10, detalhe_max: 300,
      telefone_titulo: 'Telefone com DDD',
      consentimento: 'Autorizo a Imediato a usar meu telefone só para dar retorno sobre esta pesquisa.',
      assuntos: LISTAS.assuntos },
    { id: 'fim', tipo: 'fim' }
  ]);

  return {
    versao: VERSAO, PREFIRO_NAO: PREFIRO_NAO, avisoTexto: AVISO_TEXTO, maisPrefiro: maisPrefiro, NAO_ESTA: NAO_ESTA, SEM_PROBLEMA: SEM_PROBLEMA, PAG_ABERTO: PAG_ABERTO,
    cidades: CIDADES, estadosBR: ESTADOS_BR, ufsDa: ufsDa, cidadesDa: cidadesDa, cidadeMin: 2, cidadeMax: 60,
    operacoes: OPERACOES, nomeLider: NOME_LIDER, estados: ESTADOS_BR, notaRotulos: NOTA_ROTULOS,
    areas: AREAS, problemas: PROBLEMAS, espera: ESPERA, listas: LISTAS,
    intencaoRisco: INTENCAO_RISCO, intencaoFirme: INTENCAO_FIRME,
    notas: NOTAS, telas: TELAS,
    tipoEspera: tipoEspera, problemasDa: problemasDa,
    placaRegex: '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$',
    textoMin: 3, textoMax: 150
  };
})();
