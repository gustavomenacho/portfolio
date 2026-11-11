// Portfólio - Gustavo Menacho
// tudo em JavaScript puro, sem bibliotecas

// ---------- animacao de entrada (fade-up) ----------
// cada elemento com a classe "reveal" aparece quando entra na tela

const reveals = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visivel");
          revealObserver.unobserve(entry.target); // anima so uma vez
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  reveals.forEach(function (element) {
    revealObserver.observe(element);
  });
} else {
  // navegador antigo: mostra tudo direto
  reveals.forEach(function (element) {
    element.classList.add("visivel");
  });
}

// cards lado a lado aparecem um pouquinho depois do outro
document.querySelectorAll(".bento, .pilares, .galeria, .projetos-grid").forEach(function (grupo) {
  const itens = grupo.querySelectorAll(".reveal");
  itens.forEach(function (item, index) {
    item.style.transitionDelay = index * 80 + "ms";
  });
});

// ---------- link ativo na navegacao ----------
// deixa branco o link da secao que esta na tela

const navLinks = document.querySelectorAll(".nav-links a");
const secoes = document.querySelectorAll("#sobre, #filosofia, #projetos, #contato");

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navLinks.forEach(function (link) {
            const ativo = link.getAttribute("href") === "#" + entry.target.id;
            link.classList.toggle("ativo", ativo);
            if (ativo) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  secoes.forEach(function (secao) {
    navObserver.observe(secao);
  });
}

// ---------- galeria e lightbox ----------

const fotos = Array.from(document.querySelectorAll(".foto-botao"));
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxLegenda = document.getElementById("lightboxLegenda");
const fecharLightbox = document.getElementById("fecharLightbox");
let fotoAtual = 0;
let botaoQueAbriu = null;

function mostrarFoto(index) {
  const botao = fotos[index];
  const img = botao.querySelector("img");
  const legenda = botao.parentElement.querySelector("figcaption");

  fotoAtual = index;
  lightboxImg.src = botao.dataset.full;
  lightboxImg.alt = img.alt;
  lightboxLegenda.innerHTML = legenda ? legenda.innerHTML : "";
}

function abrirLightbox(index) {
  botaoQueAbriu = fotos[index];
  mostrarFoto(index);
  lightbox.showModal();
  document.body.style.overflow = "hidden"; // trava a rolagem atras
}

function fecharFoto() {
  lightbox.close();
}

fotos.forEach(function (botao, index) {
  botao.addEventListener("click", function () {
    abrirLightbox(index);
  });

  // se a imagem nao existir em assets/, mostra o nome do arquivo no lugar
  const img = botao.querySelector("img");
  img.addEventListener("error", function () {
    botao.classList.add("sem-imagem");
  });
});

// a janela de ampliar so existe nas paginas de projeto
if (lightbox) {
  fecharLightbox.addEventListener("click", fecharFoto);

  // clicar fora da imagem tambem fecha
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) {
      fecharFoto();
    }
  });

  // quando fecha (botao, clique fora ou Esc), libera a rolagem e devolve o foco
  lightbox.addEventListener("close", function () {
    document.body.style.overflow = "";
    if (botaoQueAbriu) {
      botaoQueAbriu.focus();
    }
  });

  // setas do teclado passam para a proxima foto
  lightbox.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      mostrarFoto((fotoAtual + 1) % fotos.length);
    }
    if (event.key === "ArrowLeft") {
      mostrarFoto((fotoAtual - 1 + fotos.length) % fotos.length);
    }
  });
}

// ---------- tema claro / escuro ----------
// o tema padrao e o escuro. a escolha fica salva no navegador

const temaBotao = document.getElementById("temaBotao");
const corDoNavegador = document.querySelector('meta[name="theme-color"]');

function aplicarTema(tema) {
  if (tema === "light") {
    document.documentElement.dataset.theme = "light";
    temaBotao.setAttribute("aria-label", "Ativar tema escuro");
    corDoNavegador.setAttribute("content", "#f5f5f7");
  } else {
    delete document.documentElement.dataset.theme;
    temaBotao.setAttribute("aria-label", "Ativar tema claro");
    corDoNavegador.setAttribute("content", "#000000");
  }
}

temaBotao.addEventListener("click", function () {
  let novoTema = "light";
  if (document.documentElement.dataset.theme === "light") {
    novoTema = "dark";
  }
  aplicarTema(novoTema);
  try {
    localStorage.setItem("portfolio-tema", novoTema);
  } catch (error) {
    // se nao der pra salvar, vale so ate fechar a pagina
  }
});

// deixa o botao certo com o tema que o script do <head> ja aplicou
aplicarTema(document.documentElement.dataset.theme === "light" ? "light" : "dark");

// ---------- foto do sobre mim ----------
// se ainda nao tiver assets/foto.jpg, mostra as iniciais

const sobreFoto = document.querySelector(".sobre-foto");

function semFoto() {
  sobreFoto.classList.add("sem-foto");
}

// so existe no inicio
if (sobreFoto) {
  const sobreImg = sobreFoto.querySelector("img");
  sobreImg.addEventListener("error", semFoto);
  // a imagem pode ter dado erro antes do script carregar
  if (sobreImg.complete && sobreImg.naturalWidth === 0) {
    semFoto();
  }
}

// ---------- copiar e-mail ----------

const copiarEmail = document.getElementById("copiarEmail");
const copiarTexto = document.getElementById("copiarTexto");
const aviso = document.getElementById("aviso");
let timerCopiar = null;

// plano B pra navegador que nao deixa usar navigator.clipboard
function copiarDoJeitoAntigo(texto) {
  const campo = document.createElement("textarea");
  campo.value = texto;
  campo.setAttribute("readonly", "");
  campo.style.position = "fixed";
  campo.style.opacity = "0";
  document.body.appendChild(campo);
  campo.select();
  const deuCerto = document.execCommand("copy");
  document.body.removeChild(campo);
  return deuCerto;
}

async function copiar() {
  const email = copiarEmail.dataset.email;
  let deuCerto = false;

  try {
    await navigator.clipboard.writeText(email);
    deuCerto = true;
  } catch (error) {
    deuCerto = copiarDoJeitoAntigo(email);
  }

  clearTimeout(timerCopiar);
  if (deuCerto) {
    copiarEmail.classList.add("copiado");
    copiarTexto.textContent = "Copiado!";
    aviso.textContent = "E-mail copiado: " + email;
  } else {
    aviso.textContent = "Não deu para copiar. Meu e-mail é " + email;
  }

  // volta o botao ao normal depois de 2,5 segundos
  timerCopiar = setTimeout(function () {
    copiarEmail.classList.remove("copiado");
    copiarTexto.textContent = "Copiar e-mail";
    aviso.textContent = "";
  }, 2500);
}

// o botao de copiar so existe no inicio
if (copiarEmail) {
  copiarEmail.addEventListener("click", copiar);
}
