// Adicionar formatação automática de datas
document.querySelectorAll('.date-input').forEach(input => {
  input.addEventListener('input', (event) => {
    let value = event.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d+)/, '$1/$2'); // Adiciona a primeira barra
    }
    if (value.length > 5) {
      value = value.replace(/^(\d{2})\/(\d{2})(\d+)/, '$1/$2/$3'); // Adiciona a segunda barra
    }
    event.target.value = value; // Atualiza o campo de entrada
  });
});

// Função para gerar mensagens
document.getElementById('generateButton').addEventListener('click', async () => {
  const nomeAula = document.getElementById('nomeAula').value;
  const temaAula = document.getElementById('temaAula').value;
  const Link = document.getElementById('Link').value;
  const diaSemana = document.getElementById('diaSemana').value;
  const tipoMensagem = document.getElementById('tipoMensagem').value;

  // Função para validar e converter a data
  const criarDataFlexivel = (dataString) => {
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();

    // Regex para os formatos aceitos
    const regexCompleto = /^(\d{2})\/(\d{2})\/(\d{4})$/; // DD/MM/AAAA
    const regexDiaMes = /^(\d{2})\/(\d{2})$/;            // DD/MM

    let dia, mes, ano;

    if (regexCompleto.test(dataString)) {
      // Formato completo
      [, dia, mes, ano] = dataString.match(regexCompleto).map(Number);
    } else if (regexDiaMes.test(dataString)) {
      // Apenas dia e mês, assume o ano atual
      [, dia, mes] = dataString.match(regexDiaMes).map(Number);
      ano = anoAtual;
    } else {
      throw new Error("Formato de data inválido! Use DD/MM ou DD/MM/AAAA.");
    }

    return { dia, mes, ano };
  };

  // Função para formatar a data no estilo DD/MM/YYYY
  const formatarData = ({ dia, mes, ano }) => {
    return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
  };

  try {
    const dataAbertura = criarDataFlexivel(document.getElementById('dataAbertura').value);
    const dataEncerramento = criarDataFlexivel(document.getElementById('dataEncerramento').value);

    const dataAberturaFormatada = formatarData(dataAbertura);
    const dataEncerramentoFormatada = formatarData(dataEncerramento);

    // Carrega as mensagens do arquivo JSON
    const response = await fetch('mensagens.json');
    const modelosMensagens = await response.json();

    // Substitui os placeholders no texto do modelo
    const mensagemModelo = modelosMensagens[tipoMensagem];
    const mensagemGerada = mensagemModelo
      .replace(/{{nomeAula}}/g, nomeAula)
      .replace(/{{temaAula}}/g, temaAula)
      .replace(/{{Link}}/g, Link)
      .replace(/{{dataAbertura}}/g, dataAberturaFormatada)
      .replace(/{{dataEncerramento}}/g, dataEncerramentoFormatada)
      .replace(/{{diaSemana}}/g, diaSemana);

    // Exibe a mensagem gerada
    document.getElementById('generatedMessage').value = mensagemGerada;
  } catch (error) {
    alert(`Erro: ${error.message}`);
  }
});
