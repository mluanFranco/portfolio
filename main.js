const header = document.querySelector(".site-header");

// Fundo do header ao rolar a página
function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// Ano atual no copyright do rodapé
document.getElementById("ano").textContent = new Date().getFullYear();

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
    setStatus("Enviando...");

    try {
      const response = await fetch(contactForm.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(contactForm),
      });
      const data = await response.json();
      if (!response.ok || data.success !== true) throw new Error(data.message);

      contactForm.reset();
      setStatus("Mensagem enviada! Obrigado pelo contato.", "success");
    } catch (error) {
      setStatus("Não foi possível enviar. Tente novamente mais tarde.", "error");
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
  const text = typewriter.dataset.text;
  const TYPE_SPEED = 80;
  const DELETE_SPEED = 40;
  const PAUSE_TYPED = 2000;
  const PAUSE_DELETED = 600;

  // Quem prefere menos movimento vê o texto completo, sem animação
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    typewriter.textContent = text;
  } else {
    let index = 0;
    let deleting = false;

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
      setTimeout(tick, delay);
    }

    tick();
  }
}
