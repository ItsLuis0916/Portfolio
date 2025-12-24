
window.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".fade");
  function reveal() {
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add("visible");
    });
  }
  window.addEventListener("scroll", reveal, { passive: true });
  reveal();
});

const canvas = document.getElementById("starfield");
const ctx = canvas ? canvas.getContext("2d") : null;
let stars = [];
let STAR_COUNT = 300;

function random(min, max) { return Math.random() * (max - min) + min; }

function calcStarCount() {
  const w = window.innerWidth;
  if (w <= 480) return 80;
  if (w <= 1024) return 160;
  return 300;
}

function setCanvasSize() {
  if (!canvas) return;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * ratio);
  canvas.height = Math.round(window.innerHeight * ratio);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  if (ctx) ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function initStars() {
  if (!canvas || !ctx) return;
  STAR_COUNT = calcStarCount();
  setCanvasSize();
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: random(0, window.innerWidth),
      y: random(0, window.innerHeight),
      radius: random(0.4, 1.6),
      speedX: random(-0.05, 0.05),
      speedY: random(0.08, 0.28),
      alpha: random(0.08, 0.5),
      alphaChange: random(0.0008, 0.003)
    });
  }
}

function animateStars() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(star => {
    star.alpha += star.alphaChange;
    if (star.alpha > 0.6 || star.alpha < 0.05) star.alphaChange *= -1;

    ctx.fillStyle = `rgba(200,200,200,${star.alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();

    star.x += star.speedX;
    star.y -= star.speedY;

    if (star.y < 0) star.y = window.innerHeight;
    if (star.x < 0) star.x = window.innerWidth;
    if (star.x > window.innerWidth) star.x = 0;
  });
  requestAnimationFrame(animateStars);
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    initStars();
    updateCarousel(); 
    centerMiddleExpSlide(); 
  }, 180);
});

initStars();
animateStars();

const spotlight = document.getElementById("cursor-spotlight");

const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (spotlight) {
  if (isTouch) {
    spotlight.remove();
  } else {
    document.addEventListener(
      "mousemove",
      (e) => {
        spotlight.style.top = `${e.clientY}px`;
        spotlight.style.left = `${e.clientX}px`;
      },
      { passive: true }
    );
  }
}


const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-menu a');

function closeMobileMenu() {
  if (!navMenu) return;
  navMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  navMenu.setAttribute('aria-hidden', 'true');
}

function openMobileMenu() {
  if (!navMenu) return;
  navMenu.classList.add('open');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  navMenu.setAttribute('aria-hidden', 'false');
}

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.contains('open');
    if (isOpen) closeMobileMenu();
    else openMobileMenu();
  });

  navLinks.forEach(a => a.addEventListener('click', () => closeMobileMenu()));

  document.addEventListener('click', (e) => {
    if (!navMenu.classList.contains('open')) return;
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) closeMobileMenu();
  }, { passive: true });
}

const track = document.querySelector('.carousel-track:not(.experience)');
let slides = track ? Array.from(track.children) : [];
const nextBtn = document.querySelector('.carousel-btn.next');
const prevBtn = document.querySelector('.carousel-btn.prev');
let currentIndex = 0;

function getGap() {
  if (!track) return 18;
  const st = getComputedStyle(track);
  const g = st.gap || st.gridGap || "18px";
  return parseFloat(g) || 18;
}

function getSlideWidth() {
  if (!slides[0]) return 0;
  const rect = slides[0].getBoundingClientRect();
  return rect.width + getGap();
}

function updateCarousel() {
  if (!track || slides.length === 0) return;
  if (window.innerWidth <= 768) {
    track.style.transform = '';
    return;
  }
  const gap = getGap();
  const slideRect = slides[0].getBoundingClientRect();
  const slideWidth = slideRect.width;
  const slideOuter = slideWidth + gap;
  const container = track.parentElement;
  const containerWidth = container ? container.clientWidth : window.innerWidth;
  let target = currentIndex * slideOuter - (containerWidth - slideOuter) / 2;
  const maxTranslate = Math.max(0, slideOuter * slides.length - containerWidth);
  if (target < 0) target = 0;
  if (target > maxTranslate) target = maxTranslate;
  track.style.transform = `translateX(-${target}px)`;
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (!slides.length) return;
    currentIndex = Math.min(currentIndex + 1, slides.length - 1);
    updateCarousel();
  });
}
if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    if (!slides.length) return;
    currentIndex = Math.max(currentIndex - 1, 0);
    updateCarousel();
  });
}

window.addEventListener('resize', () => {
  slides = track ? Array.from(track.children) : [];
  if (currentIndex > slides.length - 1) currentIndex = Math.max(0, slides.length - 1);
  updateCarousel();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') {
    if (!slides.length) return;
    currentIndex = Math.min(currentIndex + 1, slides.length - 1);
    updateCarousel();
  } else if (e.key === 'ArrowLeft') {
    if (!slides.length) return;
    currentIndex = Math.max(currentIndex - 1, 0);
    updateCarousel();
  }
});

(function addSwipe() {
  if (!track) return;
  let startX = 0, deltaX = 0, isDown = false;

  track.addEventListener('pointerdown', (e) => {
    if (window.innerWidth <= 768) return;
    isDown = true;
    startX = e.clientX;
    track.style.transition = 'none';
  }, { passive: true });

  window.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    deltaX = e.clientX - startX;
    const slideWidth = getSlideWidth();
    const offset = -currentIndex * slideWidth + deltaX;
    track.style.transform = `translateX(${offset}px)`;
  }, { passive: true });

  window.addEventListener('pointerup', () => {
    if (!isDown) return;
    isDown = false;
    track.style.transition = '';
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) currentIndex = Math.min(currentIndex + 1, slides.length - 1);
      else currentIndex = Math.max(currentIndex - 1, 0);
    }
    deltaX = 0;
    updateCarousel();
  }, { passive: true });

  window.addEventListener('pointercancel', () => { isDown = false; deltaX = 0; updateCarousel(); }, { passive: true });
})();

window.requestAnimationFrame(() => {
  slides = track ? Array.from(track.children) : [];
  updateCarousel();
});

const discordBox = document.getElementById('contact-discord');
const discordName = document.getElementById('discord-name');
const discordMsg = document.getElementById('discord-copied');
if (discordBox && discordName && discordMsg) {
  const doCopy = () => {
    navigator.clipboard?.writeText(discordName.textContent.trim()).catch(()=>{});
    discordMsg.textContent = 'Copied!';
    setTimeout(() => discordMsg.textContent = 'Click to copy', 1500);
  };
  discordBox.addEventListener('click', doCopy);
  discordBox.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') doCopy(); });
}

const emailBox = document.getElementById('contact-email');
const emailName = document.getElementById('email-name');
const emailMsg = document.getElementById('email-copied');
if (emailBox && emailName && emailMsg) {
  const doCopyEmail = () => {
    navigator.clipboard?.writeText(emailName.textContent.trim()).catch(()=>{});
    emailMsg.textContent = 'Copied!';
    setTimeout(() => emailMsg.textContent = 'Click to copy', 1500);
  };
  emailBox.addEventListener('click', doCopyEmail);
  emailBox.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') doCopyEmail(); });
}

window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.scrollHeight - window.innerHeight || 1;
  const scrollPercent = (scrollTop / docHeight) * 100;
  const bar = document.querySelector('.scroll-progress-bar');
  if (bar) bar.style.width = scrollPercent + '%';
}, { passive: true });

const sections = document.querySelectorAll("section[id]");
const navLinksDesktop = document.querySelectorAll(".nav-links a");

function activateNav() {
  let scrollPos = window.scrollY + window.innerHeight / 2;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute("id");
    if (scrollPos >= top && scrollPos < top + height) {
      navLinksDesktop.forEach(link => link.classList.remove("active"));
      const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (activeLink) activeLink.classList.add("active");
    }
  });
}
window.addEventListener("scroll", activateNav, { passive: true });
activateNav();

const expTrack = document.querySelector('.carousel-track.experience');
let expSlides = expTrack ? Array.from(expTrack.children) : [];

function centerMiddleExpSlide() {
  if (!expTrack || !expSlides.length) return;

  const container = expTrack.parentElement;
  const containerWidth = container ? container.clientWidth : window.innerWidth;

  let middleIndex = Math.floor(expSlides.length / 2);
  let slideWidth = expSlides[0].getBoundingClientRect().width;
  let gap = parseFloat(getComputedStyle(expTrack).gap) || 18;

  let offset = middleIndex * (slideWidth + gap) - (containerWidth - slideWidth) / 2;
  const maxTranslate = Math.max(0, expSlides.length * (slideWidth + gap) - containerWidth);
  if (offset < 0) offset = 0;
  if (offset > maxTranslate) offset = maxTranslate;

  expTrack.style.transform = `translateX(-${offset}px)`;
}

window.addEventListener('load', () => {
  expSlides = expTrack ? Array.from(expTrack.children) : [];
  centerMiddleExpSlide();
});

window.addEventListener('resize', () => {
  expSlides = expTrack ? Array.from(expTrack.children) : [];
  centerMiddleExpSlide();


const contactForm = document.getElementById("contactForm");
const statusEl = document.getElementById("status");
const submitBtn = document.getElementById("contactSubmit");
const endpoint = "https://contact-form.itsluis1507.workers.dev"; 

if (contactForm) {

  async function setStatus(text, type = "") {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.classList.remove("success", "error");
    if (type) statusEl.classList.add(type);
  }

  contactForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = (document.getElementById("name") || {}).value?.trim() || "";
    const email = (document.getElementById("email") || {}).value?.trim() || "";
    const message = (document.getElementById("message") || {}).value?.trim() || "";

    if (!name || !email || !message) {
      setStatus("Please fill out all fields.", "error");
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute("aria-busy", "true");
    }
    setStatus("Sending...");

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json && json.success) {
        setStatus("Message sent!", "success");
        contactForm.reset();
      } else {
        const msg = (json && json.error) ? json.error : "Error sending message.";
        setStatus(msg, "error");
      }

    } catch (err) {
      setStatus("Connection error. Please try again later.", "error");
      console.error("Contact form send error:", err);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute("aria-busy");
      }

      setTimeout(() => {
        if (statusEl && statusEl.classList.contains("success")) {
          statusEl.textContent = "";
          statusEl.classList.remove("success");
        }
      }, 3000);
    }
  });

  if (submitBtn) {
    submitBtn.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        submitBtn.click();
      }
    });
  }
}
});
