/* Configuração da landing. Edite só este arquivo. */
window.BRAVA = {
  /* WhatsApp da BRAVA, só números, com DDI. Exemplo: "14075550100".
     Preenchido, o formulário abre o WhatsApp com a mensagem pronta. */
  whatsapp: "",

  /* Endereço de envio do formulário (Formspree, Make, Zapier ou outro serviço).
     Se preenchido, tem prioridade sobre o WhatsApp. */
  envioFormulario: "",

  /* Nome e cargo na ordem das fotos da seção Quem somos: camisa vermelha, depois paletó cinza.
     Vazio, a legenda não aparece. */
  lideres: [
    { nome: "", cargo: "" },
    { nome: "", cargo: "" }
  ],

  /* Resultados reais e autorizados de clientes. Vazio, a área não aparece.
     Modelo: { negocio: "Nome", local: "Orlando, FL", numero: "+40%", resultado: "o que foi medido e em qual período", fonte: "origem do dado" } */
  casos: []
};
