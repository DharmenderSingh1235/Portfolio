const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

const progress = $('.progress');
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - innerHeight;
  progress.style.width = `${(scrollY / h) * 100}%`;
}, {passive:true});

const menuBtn = $('.menu-btn');
const navLinks = $('.nav-links');
menuBtn.addEventListener('click', () => navLinks.classList.toggle('open'));
$$('.nav-links a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){ entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  });
}, {threshold:.12});
$$('.reveal').forEach(el => revealObserver.observe(el));

const sections = $$('main section[id]');
const links = $$('.nav-links a');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, {rootMargin:'-40% 0px -50% 0px'});
sections.forEach(s => sectionObserver.observe(s));

// Project search and category filters
const projectCards = $$('.project');
const projectSearch = $('#project-search');
const projectFilters = $$('.filter-chip');
const projectCount = $('#project-count');
const projectEmpty = $('.project-empty');
let activeFilter = 'all';
let filterRun = 0;

function filterProjects() {
  const run = ++filterRun;
  const query = projectSearch.value.trim().toLowerCase();
  let visibleCount = 0;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  projectCards.forEach(card => {
    card.getAnimations().forEach(animation => animation.cancel());
    const matchesCategory = activeFilter === 'all' || card.dataset.category.split(' ').includes(activeFilter);
    const matchesSearch = !query || card.textContent.toLowerCase().includes(query);
    const isVisible = matchesCategory && matchesSearch;
    if (isVisible) {
      visibleCount++;
      if (card.hidden) {
        card.hidden = false;
        if (!reduceMotion) {
          card.animate(
            [{ opacity: 0, transform: 'translateY(14px) scale(.98)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }],
            { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' }
          );
        }
      }
    } else if (!card.hidden) {
      if (reduceMotion) {
        card.hidden = true;
      } else {
        const animation = card.animate(
          [{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(8px) scale(.98)' }],
          { duration: 180, easing: 'ease-in' }
        );
        animation.onfinish = () => {
          if (run === filterRun) card.hidden = true;
        };
      }
    }
  });

  projectCount.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? 'project' : 'projects'}`;
  projectEmpty.hidden = visibleCount !== 0;
}

projectSearch.addEventListener('input', filterProjects);
projectFilters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  projectFilters.forEach(filter => {
    const isActive = filter === button;
    filter.classList.toggle('active', isActive);
    filter.setAttribute('aria-pressed', String(isActive));
  });
  filterProjects();
}));

// Subtle pointer tilt adds depth to project cards on mouse and trackpad.
if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  projectCards.forEach(card => {
    card.addEventListener('pointermove', event => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      card.style.setProperty('--tilt-x', `${x * 5}deg`);
      card.style.setProperty('--tilt-y', `${y * -5}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.removeProperty('--tilt-x');
      card.style.removeProperty('--tilt-y');
    });
  });
}

const particles = $('.particles');
for(let i=0;i<45;i++){
  const p=document.createElement('i');
  p.style.left=Math.random()*100+'%';
  p.style.animationDuration=(8+Math.random()*16)+'s';
  p.style.animationDelay=(-Math.random()*20)+'s';
  particles.appendChild(p);
}

const glow = $('.cursor-glow');
window.addEventListener('pointermove', e => {
  glow.style.left=e.clientX+'px'; glow.style.top=e.clientY+'px';
}, {passive:true});
