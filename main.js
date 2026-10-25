const header = document.querySelector(".site-header");

// Fundo do header ao rolar a página
function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 10);
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// Ano atual no copyright do rodapé
document.getElementById("ano").textContent = new Date().getFullYear();

// Carrossel de tecnologias: duplica os itens para o loop infinito
const techTrack = document.querySelector(".tech-track");
if (techTrack && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  [...techTrack.children].forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    techTrack.appendChild(clone);
  });
}

// Formulário de contato: envia a mensagem por e-mail via FormSubmit
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
      const endpoint = contactForm.action.replace("formsubmit.co/", "formsubmit.co/ajax/");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(contactForm),
      });
      const data = await response.json();
      if (!response.ok || String(data.success) !== "true") throw new Error(data.message);

      contactForm.reset();
      setStatus("Mensagem enviada! Obrigado pelo contato.", "success");
    } catch (error) {
      setStatus("Não foi possível enviar. Tente novamente mais tarde.", "error");
    } finally {
      submitBtn.disabled = false;
    }
  });
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
