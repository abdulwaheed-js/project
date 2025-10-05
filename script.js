/* script.js
   Controls:
   - Slider prev/next manual navigation
   - Slide translation + active classes
   - Trigger per-slide text animations
   - Button press visual
   - Nav link focus blur behavior (JS fallback + robust)
*/

document.addEventListener('DOMContentLoaded', () => {
  /* ---------------- NAV focus behavior (works cross-browser) ---------------- */
  const nav = document.querySelector('.nav');
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const brand = document.querySelector('.brand');

  // Add/Remove hovered class to clicked/hovered links for blur-of-others
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      // mark link hovered and set focus-active on nav
      links.forEach(l => l.classList.remove('hovered'));
      link.classList.add('hovered');
      nav.classList.add('focus-active');
    });
    link.addEventListener('mouseleave', () => {
      link.classList.remove('hovered');
      // if no hovered remain, remove focus-active
      if (!links.some(l => l.classList.contains('hovered'))) {
        nav.classList.remove('focus-active');
      }
    });
    // keyboard support
    link.addEventListener('focus', () => {
      links.forEach(l => l.classList.remove('hovered'));
      link.classList.add('hovered');
      nav.classList.add('focus-active');
    });
    link.addEventListener('blur', () => {
      link.classList.remove('hovered');
      if (!links.some(l => l.classList.contains('hovered'))) {
        nav.classList.remove('focus-active');
      }
    });
  });

  // Brand hover should blur other links (as requested)
  brand.addEventListener('mouseenter', () => nav.classList.add('focus-active'));
  brand.addEventListener('mouseleave', () => {
    // only remove if no link hovered
    if (!links.some(l => l.classList.contains('hovered'))) nav.classList.remove('focus-active');
  });

  /* ---------------- SLIDER BEHAVIOR ---------------- */
  const slidesWrap = document.querySelector('.slides');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const btnPrev = document.querySelector('.slider-btn.prev');
  const btnNext = document.querySelector('.slider-btn.next');

  let current = 0;
  const total = slides.length;

  // Helper: update visual translate and active classes
  function goto(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    current = index;

    // move slides container
    const translatePercent = -(index * (100 / total));
    slidesWrap.style.transform = `translateX(${translatePercent}%)`;

    // activate slide
    slides.forEach((sl, i) => {
      if (i === index) {
        sl.classList.add('active');
      } else {
        sl.classList.remove('active');
      }
    });
  }

  // initial
  goto(0);

  // button click mechanics with press animation and then change
  function attachBtn(btn, dir) {
    btn.addEventListener('click', (e) => {
      // press visual
      btn.classList.add('pressing');
      // small delay to feel press; then go to next slide
      setTimeout(() => {
        btn.classList.remove('pressing');
        if (dir === 'next') goto(current + 1);
        else goto(current - 1);
      }, 150);
    });

    // optional: keyboard activation for accessibility
    btn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        btn.click();
      }
    });
  }

  attachBtn(btnPrev, 'prev');
  attachBtn(btnNext, 'next');

  /* Extra: When buttons are hovered, they show glossy layer via CSS already. Keep arrow crisp. */

  /* Accessibility: allow arrow keys to change slides when focus is in slider region */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { goto(current + 1); }
    if (e.key === 'ArrowLeft')  { goto(current - 1); }
  });

  /* Reset slide positions on resize to keep consistent */
  window.addEventListener('resize', () => {
    goto(current);
  });
    window.addEventListener('resize', () => {
    goto(current);
  });


/* ---------------- IMAGE HOVER BLUR OVERLAY ---------------- */
const blurOverlay = document.querySelector('.blur-overlay');
const allSlides = document.querySelectorAll('.slide');

allSlides.forEach(slide => {
  slide.addEventListener('mouseenter', () => {
    // Add blur to the entire page background
    document.body.style.backdropFilter = 'blur(12px)';
    document.body.style.webkitBackdropFilter = 'blur(12px)';
    
    // Make sure the hovered slide stays clear
    slide.style.filter = 'none';
    slide.style.zIndex = '10';
  });
  
  slide.addEventListener('mouseleave', () => {
    // Remove blur from the entire page
    document.body.style.backdropFilter = 'none';
    document.body.style.webkitBackdropFilter = 'none';
    
    // Reset slide z-index
    slide.style.zIndex = '';
  });
});
});

const cards = document.querySelectorAll('.card');
const container = document.querySelector('.tour');

cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    container.classList.add('active');
    cards.forEach(c => {
      if (c !== card) c.classList.add('blurred');
    });
    card.classList.add('focused');
  });

  card.addEventListener('mouseleave', () => {
    container.classList.remove('active');
    cards.forEach(c => {
      c.classList.remove('blurred', 'focused');
    });
  });
});




// script.js — robust hover logic so only other cards blur when hovering a card

const gallery = document.querySelector('.gallery');
if (!gallery) throw new Error('Gallery element not found');

const cards1 = Array.from(gallery.querySelectorAll('.img-card'));

let focusedCard = null;
let leaveTimeout = null;

// helper: focus a card
function focusCard(card) {
  if (focusedCard === card) return;
  clearTimeout(leaveTimeout);

  // remove existing focus
  cards1.forEach(c => c.classList.remove('focused'));
  focusedCard = card;
  card.classList.add('focused');
  gallery.classList.add('active');
}

// helper: clear focus
function clearFocusSoon(card) {
  // small debounce to avoid accidental quick flickers
  if (leaveTimeout) clearTimeout(leaveTimeout);
  leaveTimeout = setTimeout(() => {
    focusedCard = null;
    cards1.forEach(c => c.classList.remove('focused'));
    gallery.classList.remove('active');
    leaveTimeout = null;
  }, 80); // short: 80ms
}

// attach events
cards1.forEach(card => {
  card.addEventListener('mouseenter', () => focusCard(card));
  card.addEventListener('focus', () => focusCard(card)); // keyboard
  card.addEventListener('mouseleave', () => clearFocusSoon(card));
  card.addEventListener('blur', () => clearFocusSoon(card)); // keyboard
  // prevent child elements (button) from causing parent to lose hover:
  card.querySelectorAll('*').forEach(child => {
    child.addEventListener('mouseenter', () => {
      if (focusedCard !== card) focusCard(card);
    });
  });
});

// if the pointer leaves the gallery entirely, clear immediately
gallery.addEventListener('mouseleave', () => {
  if (leaveTimeout) clearTimeout(leaveTimeout);
  focusedCard = null;
  cards1.forEach(c => c.classList.remove('focused'));
  gallery.classList.remove('active');
});
