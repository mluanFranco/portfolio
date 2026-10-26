const header = document.querySelector(".site-header");

// Fundo do header ao rolar a página
function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// Ano atual no copyright do rodapé
document.getElementById("ano").textContent = new Date().getFullYear();

// Tema claro / escuro (a escolha fica salva no navegador)
const root = document.documentElement;
document.querySelector(".theme-toggle").addEventListener("click", () => {
  const tema = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = tema;
  try {
    localStorage.setItem("tema", tema);
  } catch (e) {}
});

// Traduções: cada elemento com data-i18n="chave" recebe o texto do idioma atual;
// data-i18n-attr="atributo:chave;..." traduz atributos (placeholder, aria-label etc.)
const TRANSLATIONS = {
  pt: {
    "meta.title": "Matheus Franco - Game Developer",
    "meta.description": "Portfólio de Matheus Franco, game developer.",
    "nav.about": "Sobre",
    "nav.projects": "Jogos / Projetos",
    "nav.contact": "Contato",
    "controls.lang": "Switch to English",
    "controls.theme": "Alternar tema claro/escuro",
    "hero.avatarAlt": "Avatar de Matheus Franco",
    "hero.greeting": "Olá! Eu sou o Matheus.",
    "hero.role": "Game Developer",
    "hero.subtitle": "Construindo experiências marcantes, interativas e imersivas.",
    "about.title": "Sobre mim",
    "about.p1":
      "Sou um profissional de TI com mais de 3 anos de experiência na área e, atualmente, atuo na sustentação de sistemas ERP.",
    "about.p2":
      "Minha paixão por games começou ainda na infância e me acompanha até hoje. No desenvolvimento de jogos, encontro a oportunidade de unir técnica e arte para criar experiências únicas para quem joga.",
    "about.cv": "Baixar CV",
    "about.cvTitle": "Baixar currículo (PDF)",
    "projects.title": "Jogos / Projetos",
    "projects.name1": "Projeto 1",
    "projects.name2": "Projeto 2",
    "projects.name3": "Projeto 3",
    "projects.description": "Breve descrição do projeto.",
    "projects.tag": "Tecnologia",
    "projects.link": "Ver no GitHub →",
    "tech.title": "Tecnologias",
    "contact.title": "Contato",
    "contact.name": "Nome",
    "contact.namePlaceholder": "Seu nome",
    "contact.email": "E-mail",
    "contact.emailPlaceholder": "voce@exemplo.com",
    "contact.message": "Mensagem",
    "contact.messagePlaceholder": "Escreva sua mensagem...",
    "contact.send": "Enviar mensagem",
    "contact.sending": "Enviando...",
    "contact.success": "Mensagem enviada! Obrigado pelo contato.",
    "contact.error": "Não foi possível enviar. Tente novamente mais tarde.",
    "footer.rights": "Todos os direitos reservados.",
  },
  en: {
    "meta.title": "Matheus Franco - Game Developer",
    "meta.description": "Matheus Franco's portfolio, game developer.",
    "nav.about": "About",
    "nav.projects": "Games / Projects",
    "nav.contact": "Contact",
    "controls.lang": "Mudar para português",
    "controls.theme": "Toggle light/dark theme",
    "hero.avatarAlt": "Matheus Franco's avatar",
    "hero.greeting": "Hi! I'm Matheus.",
    "hero.role": "Game Developer",
    "hero.subtitle": "Building memorable, interactive and immersive experiences.",
    "about.title": "About me",
    "about.p1":
      "I'm an IT professional with over 3 years of experience in the field, currently working on ERP systems support and maintenance.",
    "about.p2":
      "My passion for games started in childhood and has stayed with me ever since. In game development, I find the opportunity to combine technique and art to create unique experiences for players.",
    "about.cv": "Download CV",
    "about.cvTitle": "Download resume (PDF, in Portuguese)",
    "projects.title": "Games / Projects",
    "projects.name1": "Project 1",
    "projects.name2": "Project 2",
    "projects.name3": "Project 3",
    "projects.description": "Short project description.",
    "projects.tag": "Technology",
    "projects.link": "View on GitHub →",
    "tech.title": "Technologies",
    "contact.title": "Contact",
    "contact.name": "Name",
    "contact.namePlaceholder": "Your name",
    "contact.email": "Email",
    "contact.emailPlaceholder": "you@example.com",
    "contact.message": "Message",
    "contact.messagePlaceholder": "Write your message...",
    "contact.send": "Send message",
    "contact.sending": "Sending...",
    "contact.success": "Message sent! Thanks for reaching out.",
    "contact.error": "Couldn't send your message. Please try again later.",
    "footer.rights": "All rights reserved.",
  },
};

let lang = "pt";
const t = (key) => TRANSLATIONS[lang][key] ?? key;
const languageListeners = [];

function setLanguage(newLang) {
  lang = newLang;
  root.lang = lang === "pt" ? "pt-BR" : "en";
  document.title = t("meta.title");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":");
      el.setAttribute(attr, t(key));
    });
  });

  languageListeners.forEach((fn) => fn());
  try {
    localStorage.setItem("idioma", lang);
  } catch (e) {}
}

// Idioma inicial: o salvo, senão o do navegador do visitante
let savedLang = null;
try {
  savedLang = localStorage.getItem("idioma");
} catch (e) {}
const initialLang = savedLang || (navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en");

document.querySelector(".lang-toggle").addEventListener("click", () => {
  setLanguage(lang === "pt" ? "en" : "pt");
});

// Carrossel de tecnologias: repete os itens até cobrir a largura visível e depois
// duplica tudo, para o loop infinito não mostrar buracos (mesmo com poucos ícones)
const techTrack = document.querySelector(".tech-track");
if (techTrack && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const SCROLL_SPEED = 40; // px por segundo
  const originals = [...techTrack.children];
  const gap = parseFloat(getComputedStyle(techTrack).columnGap) || 0;
  const setWidth = techTrack.scrollWidth + gap;
  const visibleWidth = techTrack.parentElement.clientWidth;
  const repeats = Math.max(1, Math.ceil(visibleWidth / setWidth));

  const addCopy = () =>
    originals.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      techTrack.appendChild(clone);
    });

  for (let i = 1; i < repeats * 2; i++) addCopy();
  techTrack.style.animationDuration = `${(setWidth * repeats) / SCROLL_SPEED}s`;
}

// Formulário de contato: envia a mensagem por e-mail via Web3Forms
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  const status = document.getElementById("form-status");
  const submitBtn = contactForm.querySelector("button[type='submit']");

  function setStatus(text, type) {
    status.textContent = text;
    status.className = `form-status${type ? ` is-${type}` : ""}`;
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitBtn.disabled = true;
    setStatus(t("contact.sending"));

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(contactForm),
      });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error(data.message);

      contactForm.reset();
      setStatus(t("contact.success"), "success");
    } catch (error) {
      setStatus(t("contact.error"), "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

// Personagem em pixel art: corre pelo hero, pula na cabeça do avatar e segue em frente
const hero = document.querySelector(".hero");
const heroAvatar = document.querySelector(".hero-avatar");
if (hero && heroAvatar && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const PIXEL = 4; // tamanho de cada "pixel" do sprite
  const COLORS = {
    H: "#3b2a22", // cabelo
    S: "#f1c7a5", // pele
    G: "#111111", // óculos
    B: "#4a3326", // bigode / cavanhaque
    T: "#8a2846", // camiseta
    P: "#34406e", // calça
    K: "#2a1d17", // sapato
  };
  const TOP = [
    "...HHHHH....",
    "..HHHHHHH...",
    "..HHHHHHHH..",
    "..HSSSSSSH..",
    "..SGGSGGSS..",
    "..SSSSSSSS..",
    "..SSBBBSSS..",
    "...SSBSSS...",
  ];
  const FRAMES = {
    run1: [...TOP, "...TTTTTT...", "..TTTTTTTT..", ".STTTTTTTTS.", "..TTTTTTTT..", "...PPPPPP...", "...PP..PP...", "..PP....PP..", ".KK.....KK.."],
    run2: [...TOP, "...TTTTTT...", "..TTTTTTTT..", ".STTTTTTTTS.", "..TTTTTTTT..", "...PPPPPP...", "....PPPP....", "....PPPP....", "....KK.KK..."],
    jump: [...TOP, "...TTTTTT.S.", "..TTTTTTTTS.", ".STTTTTTTT..", "..TTTTTTTT..", "...PPPPPP...", "..PP..PP....", ".PP....PP...", ".KK.....KK.."],
  };
  const W = 12 * PIXEL;
  const H = 16 * PIXEL;

  function sprite(rows) {
    const rects = [];
    rows.forEach((row, y) => {
      [...row].forEach((c, x) => {
        if (COLORS[c]) rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${COLORS[c]}"/>`);
      });
    });
    return `<svg width="${W}" height="${H}" viewBox="0 0 12 16" shape-rendering="crispEdges">${rects.join("")}</svg>`;
  }

  const runner = document.createElement("div");
  runner.className = "runner";
  runner.setAttribute("aria-hidden", "true");
  runner.innerHTML = Object.entries(FRAMES)
    .map(([name, rows]) => sprite(rows).replace("<svg", `<svg data-frame="${name}"`))
    .join("");
  hero.appendChild(runner);
  const frames = Object.fromEntries([...runner.children].map((el) => [el.dataset.frame, el]));

  function showFrame(name) {
    Object.entries(frames).forEach(([key, el]) => el.classList.toggle("is-active", key === name));
  }

  const RUN_SPEED = 220; // px por segundo
  const JUMP_TIME = 0.55; // segundos de cada pulo
  const STOMP_TIME = 0.15; // pausa em cima da cabeça
  const LOOP_DELAY = 1000; // espera entre uma corrida e outra (ms)
  const GROUND_LIFT = 0.2; // sobe o "chão" em relação ao queixo do avatar (fração da altura dele)

  // Monta o trajeto com base na posição atual do avatar (recalculado a cada volta)
  function buildPath() {
    const heroBox = hero.getBoundingClientRect();
    const av = heroAvatar.getBoundingClientRect();
    const ground = av.bottom - heroBox.top - av.height * GROUND_LIFT;
    const headTop = av.top - heroBox.top + av.height * 0.04;
    const avLeft = av.left - heroBox.left;
    const avRight = av.right - heroBox.left;

    const start = -W;
    const takeoff = avLeft - W - 24;
    const head = avLeft + av.width / 2 - W / 2;
    const landing = avRight + 24;
    const end = heroBox.width + W;

    return [
      { type: "run", x0: start, x1: takeoff, y: ground, t: (takeoff - start) / RUN_SPEED },
      { type: "jump", x0: takeoff, x1: head, y0: ground, y1: headTop, t: JUMP_TIME },
      // sink: quanto o topo da cabeça desce com o "afundar" do avatar (scaleY 0.92)
      { type: "stomp", x: head, y: headTop, sink: av.height * 0.08, t: STOMP_TIME },
      { type: "jump", x0: head, x1: landing, y0: headTop, y1: ground, t: JUMP_TIME },
      { type: "run", x0: landing, x1: end, y: ground, t: (end - landing) / RUN_SPEED },
    ];
  }

  function place(x, y) {
    runner.style.transform = `translate(${x}px, ${y - H}px)`;
  }

  function runOnce() {
    const path = buildPath();
    let step = 0;
    let stepStart = performance.now();

    function frame(now) {
      const seg = path[step];
      const p = Math.min((now - stepStart) / 1000 / seg.t, 1);

      if (seg.type === "run") {
        place(seg.x0 + (seg.x1 - seg.x0) * p, seg.y);
        showFrame(Math.floor(now / 110) % 2 ? "run1" : "run2");
      } else if (seg.type === "jump") {
        // Arco de parábola: sobe acima do ponto mais alto e desce no destino
        const arc = Math.abs(seg.y0 - seg.y1) * 0.5 + 60;
        const y = seg.y0 + (seg.y1 - seg.y0) * p - arc * 4 * p * (1 - p);
        place(seg.x0 + (seg.x1 - seg.x0) * p, y);
        showFrame("jump");
      } else {
        const stomped = p < 0.8;
        place(seg.x, seg.y + (stomped ? seg.sink : 0));
        showFrame("run2");
        heroAvatar.classList.toggle("is-stomped", stomped);
      }

      if (p >= 1) {
        heroAvatar.classList.remove("is-stomped");
        step++;
        stepStart = now;
        if (step >= path.length) {
          runner.style.visibility = "hidden";
          setTimeout(() => {
            runner.style.visibility = "";
            runOnce();
          }, LOOP_DELAY);
          return;
        }
      }
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  place(-W, 0);
  setTimeout(runOnce, 500);
}

// Animação de digitação em loop: escreve, pausa, apaga, pausa...
const typewriter = document.querySelector(".typewriter");
if (typewriter) {
  let text = typewriter.dataset.text;
  const TYPE_SPEED = 80;
  const DELETE_SPEED = 40;
  const PAUSE_TYPED = 2000;
  const PAUSE_DELETED = 600;

  // Quem prefere menos movimento vê o texto completo, sem animação
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typewriter.textContent = text;
    languageListeners.push(() => (typewriter.textContent = t("hero.greeting")));
  } else {
    let index = 0;
    let deleting = false;
    let timer;

    // Ao trocar de idioma, recomeça a digitação com a nova frase
    languageListeners.push(() => {
      text = t("hero.greeting");
      index = 0;
      deleting = false;
      typewriter.textContent = "";
      clearTimeout(timer);
      timer = setTimeout(tick, PAUSE_DELETED);
    });

    function tick() {
      index += deleting ? -1 : 1;
      typewriter.textContent = text.slice(0, index);

      let delay = deleting ? DELETE_SPEED : TYPE_SPEED;
      if (!deleting && index === text.length) {
        deleting = true;
        delay = PAUSE_TYPED;
      } else if (deleting && index === 0) {
        deleting = false;
        delay = PAUSE_DELETED;
      }
      timer = setTimeout(tick, delay);
    }

    timer = setTimeout(tick, 0);
  }
}

// Aplica o idioma inicial depois que todas as partes da página estão prontas
setLanguage(initialLang);
