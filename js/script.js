var chavePublicaEmailJS = "SUA_CHAVE_PUBLICA_AQUI"; 
var idServicoEmailJS = "SEU_SERVICO_AQUI";
var idTemplateEmailJS = "SEU_TEMPLATE_AQUI";

$(document).ready(function () {

  /* Inicializa o EmailJS somente se a biblioteca estiver carregada
     (ela só é incluída em contato.html) */
  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: chavePublicaEmailJS });
  }

  /*
     marcar o link ativo do menu conforme a página atual
     */
  var paginaAtual = window.location.pathname.split("/").pop() || "index.html";

  $(".nav-link").each(function () {
    var linkPagina = $(this).attr("href");
    if (linkPagina === paginaAtual) {
      $(this).addClass("active");
    }
  });

  /*
     efeito de "digitação" no título da página inicial
     */
  var elementoDigitado = $("#textoDigitado");

  if (elementoDigitado.length) {
    var listaFrases = elementoDigitado.data("frases").split(",");
    var indiceFrase = 0;
    var indiceLetra = 0;
    var apagando = false;

    function digitarTexto() {
      var fraseAtual = listaFrases[indiceFrase];
      var textoParcial = apagando
        ? fraseAtual.substring(0, indiceLetra - 1)
        : fraseAtual.substring(0, indiceLetra + 1);

      elementoDigitado.text(textoParcial);
      indiceLetra = apagando ? indiceLetra - 1 : indiceLetra + 1;

      var velocidade = apagando ? 45 : 90;

      if (!apagando && indiceLetra === fraseAtual.length) {
        velocidade = 1400;
        apagando = true;
      } else if (apagando && indiceLetra === 0) {
        apagando = false;
        indiceFrase = (indiceFrase + 1) % listaFrases.length;
        velocidade = 300;
      }

      setTimeout(digitarTexto, velocidade);
    }

    digitarTexto();
  }

  /*
     revelar elementos com fade-in ao rolar a página
     */
  function revelarNaRolagem() {
    var alturaJanela = $(window).height();
    var posicaoRolagem = $(window).scrollTop();

    $(".revelar").each(function () {
      var elementoAtual = $(this);
      var posicaoElemento = elementoAtual.offset().top;

      if (posicaoRolagem + alturaJanela - 80 > posicaoElemento) {
        elementoAtual.addClass("visivel");
      }
    });
  }

  revelarNaRolagem();
  $(window).on("scroll", revelarNaRolagem);

  /*
     animação das barras de habilidade quando aparecerem
     */
  var barrasAnimadas = false;

  function animarBarrasHabilidade() {
    var secaoHabilidades = $("#secaoBarrasHabilidade");

    if (!secaoHabilidades.length || barrasAnimadas) {
      return;
    }

    var topoSecao = secaoHabilidades.offset().top;
    var posicaoRolagem = $(window).scrollTop();
    var alturaJanela = $(window).height();

    if (posicaoRolagem + alturaJanela - 100 > topoSecao) {
      $(".preenchimento").each(function () {
        var nivel = $(this).data("nivel");
        $(this).css("width", nivel + "%");
      });
      barrasAnimadas = true;
    }
  }

  animarBarrasHabilidade();
  $(window).on("scroll", animarBarrasHabilidade);

  /*
     filtro de projetos por tecnologia (projetos.html)
     */
  $(".filtro-tecnologia").on("click", function () {
    var tecnologiaEscolhida = $(this).data("tecnologia");

    $(".filtro-tecnologia").removeClass("ativo");
    $(this).addClass("ativo");

    if (tecnologiaEscolhida === "todos") {
      $(".item-projeto").fadeIn(250);
    } else {
      $(".item-projeto").each(function () {
        var tecnologiasDoItem = $(this).data("tecnologias");
        if (tecnologiasDoItem.indexOf(tecnologiaEscolhida) !== -1) {
          $(this).fadeIn(250);
        } else {
          $(this).fadeOut(250);
        }
      });
    }
  });

  /*
     validação do formulário + envio real de e-mail (EmailJS)
     */
  var botaoEnviar = $("#botaoEnviarMensagem");
  var textoOriginalBotao = botaoEnviar.text();

  function exibirStatus(tipo, mensagem) {
    $("#statusFormulario")
      .removeClass("sucesso erro")
      .addClass(tipo)
      .text(mensagem)
      .fadeIn();
  }

  function alternarCarregamento(estaCarregando) {
    if (estaCarregando) {
      botaoEnviar
        .prop("disabled", true)
        .html('<span class="spinner-envio"></span>Enviando...');
    } else {
      botaoEnviar.prop("disabled", false).text(textoOriginalBotao);
    }
  }

  $("#formularioContato").on("submit", function (evento) {
    evento.preventDefault();

    var campoNome = $("#campoNome").val().trim();
    var campoEmail = $("#campoEmail").val().trim();
    var campoMensagem = $("#campoMensagem").val().trim();
    var regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /*  validação via JavaScript  */
    if (campoNome === "" || campoEmail === "" || campoMensagem === "") {
      exibirStatus("erro", "Preencha todos os campos antes de enviar.");
      return;
    }

    if (!regexEmail.test(campoEmail)) {
      exibirStatus("erro", "Digite um e-mail válido.");
      return;
    }

    /* avisa se as credenciais do EmailJS ainda não foram configuradas,
       em vez de deixar a requisição falhar . */
    if (
      typeof emailjs === "undefined" ||
      chavePublicaEmailJS === "SUA_CHAVE_PUBLICA_AQUI"
    ) {
      exibirStatus(
        "erro",
        "Envio de e-mail ainda não configurado. Veja as instruções no topo do js/script.js."
      );
      return;
    }

    var parametrosEmail = {
      nome_remetente: campoNome,
      email_remetente: campoEmail,
      mensagem: campoMensagem
    };

    alternarCarregamento(true);

    /* envio real do e-mail, tem que configurar com as chaves, como o MAPA nao estava pedindo não fiz e como e um projeto aberto fiquei com reseio de colocar as chaves. */
    emailjs.send(idServicoEmailJS, idTemplateEmailJS, parametrosEmail)
      .then(function () {
        exibirStatus(
          "sucesso",
          "Mensagem enviada com sucesso! Em breve entro em contato."
        );
        $("#formularioContato")[0].reset();
      })
      .catch(function (erro) {
        console.error("Erro ao enviar e-mail:", erro);
        exibirStatus(
          "erro",
          "Não foi possível enviar sua mensagem agora. Tente novamente em instantes."
        );
      })
      .finally(function () {
        alternarCarregamento(false);
      });
  });

  /*
     botão "voltar ao topo"
     */
  var botaoTopo = $("#botaoTopo");

  $(window).on("scroll", function () {
    if ($(window).scrollTop() > 400) {
      botaoTopo.fadeIn(150);
    } else {
      botaoTopo.fadeOut(150);
    }
  });

  botaoTopo.on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 500);
  });

  /*
     fechar o menu mobile ao clicar em um link (Bootstrap)
     */
  $(".nav-link").on("click", function () {
    var menuColapsavel = $("#menuPrincipal");
    if (menuColapsavel.hasClass("show")) {
      menuColapsavel.collapse("hide");
    }
  });

});
