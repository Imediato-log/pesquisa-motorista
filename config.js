/* ============================================================================
   config.js · o Júlio preenche DEPOIS de rodar criarColetor() no Apps Script.

   Enquanto FORM_RESPONSE_URL e ENTRY_PAYLOAD estiverem vazios, a página fica em
   MODO TESTE: mostra o resultado na tela e NÃO envia nada.
   CANAIS: cada canal pode ter  url: 'https://...'  (só https). Com url, o canal vira um link
   tocável na tela final; sem url, aparece só o texto.
   Dica: com o site publicado, abra o link terminando em  #teste  para ensaiar
   sem enviar (exemplo: https://usuario.github.io/pesquisa-motorista/#teste).
   ============================================================================ */
var CONFIG = {
  FORM_RESPONSE_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSf_1uhrMfTBBkC6mb-DSUUAXXYlsZ_guI3h4lTtZhEG0EytDw/formResponse',
  ENTRY_PAYLOAD: 'entry.1502265494',
  CANAIS: [
    { 
      nome: 'Experiência do Motorista', 
      texto: 'Dúvidas, sugestões e reclamações',
      url: 'https://linktr.ee/ImediatoNexway_Meli'
    }
  ]
};
