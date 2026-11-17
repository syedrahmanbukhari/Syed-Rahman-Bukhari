const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const introduction = document.querySelector('.invitation-intro');
const languageButtons = introduction.querySelectorAll('[data-language]');
const languageChoices = languageButtons[0].parentElement;
const skipIntro = introduction.querySelector('#skip-intro');
const skipButton = skipIntro.querySelector('button');
const main = document.querySelector('main');
const page = document.documentElement;

function selectLanguage(language) {
  if (language !== 'ur') return;

  page.lang = 'ur';
  page.dir = 'rtl';
  document.title = 'اویس احمد · دعوتِ شادی';
  introduction.setAttribute('aria-label', 'دعوت نامہ کھولیے');
  for (const element of document.querySelectorAll('[data-urdu]')) {
    element.textContent = element.dataset.urdu;
  }
  skipButton.textContent = 'متحرک منظر چھوڑیں';
  updateCountdown();
}

if (typeof introduction.showModal === 'function') {
  let revealTimeout;
  introduction.showModal();
  page.classList.add('invitation-opening');

  introduction.addEventListener('close', () => {
    window.clearTimeout(revealTimeout);
    page.classList.remove('invitation-opening');
    main.focus({ preventScroll: true });
  });

  introduction.addEventListener('animationend', (event) => {
    if (event.target === introduction && event.animationName === 'intro-fade') {
      introduction.close();
    }
  });

  for (const button of languageButtons) {
    button.addEventListener('click', () => {
      selectLanguage(button.dataset.language);
      if (reducedMotion.matches) {
        introduction.close();
        return;
      }
      introduction.classList.add('is-revealing');
      languageChoices.hidden = true;
      skipIntro.hidden = false;
      skipButton.focus({ preventScroll: true });
      revealTimeout = window.setTimeout(() => introduction.close(), 2400);
    });
  }

  skipButton.addEventListener('click', () => introduction.close());
}


if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const text = main.querySelectorAll([
    '.intro > *', '.art-center', '.section-heading > *', '.event-date',
    '.event-body > *', '.calendar-actions', '.closing > *'
  ].join(', '));
  const observer = new IntersectionObserver((items) => {
    for (const item of items) {
      if (!item.isIntersecting) continue;
      item.target.classList.replace('scroll-text-pending', 'scroll-text-visible');
      observer.unobserve(item.target);
    }
  }, { rootMargin: '0px 0px -5% 0px', threshold: 0.12 });

  text.forEach((element) => element.classList.add('scroll-text-pending'));
  const observeText = () => text.forEach((element) => observer.observe(element));
  if (introduction.open) {
    introduction.addEventListener('close', observeText, { once: true });
  } else {
    observeText();
  }


  const sparkles = document.querySelector('.sparkles');
  for (let index = 0; index < 20; index += 1) {
    const sparkle = document.createElement('i');
    sparkle.style.setProperty('--x', `${8 + (index * 37) % 84}%`);
    sparkle.style.setProperty('--y', `${10 + (index * 29) % 80}%`);
    sparkle.style.setProperty('--delay', `${index % 7 / 2}s`);
    sparkles.append(sparkle);
  }
}

const countdown = document.querySelector('.countdown');
const countdownUnits = Object.fromEntries(
  Array.from(countdown.querySelectorAll('[data-unit]'), (element) => [element.dataset.unit, element])
);
const mehndiStart = Date.parse(document.querySelector('.event-time time').dateTime);

function updateCountdown() {
  const remaining = Math.ceil((mehndiStart - Date.now()) / 1000);
  countdown.hidden = remaining <= 0;
  if (countdown.hidden) return false;
  const values = {
    days: Math.floor(remaining / 86400),
    hours: Math.floor(remaining / 3600) % 24,
    minutes: Math.floor(remaining / 60) % 60,
    seconds: remaining % 60
  };
  for (const [unit, value] of Object.entries(values)) {
    countdownUnits[unit].textContent = String(value).padStart(2, '0');
  }
  return true;
}

if (updateCountdown()) {
  const timer = setInterval(() => {
    if (!updateCountdown()) clearInterval(timer);
  }, 1000);
}

const calendarButton = document.querySelector('#calendar');
calendarButton.parentElement.hidden = false;
calendarButton.addEventListener('click', () => {
  const timestamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, '');
  const entries = [
    { id: 'mehndi', title: 'Mehndi', start: '20261204T140000Z', location: 'Residence of Shehzad Ahmad' },
    { id: 'sehra-bandi', title: 'Sehra Bandi', start: '20261205T060000Z' },
    { id: 'baraat', title: 'Baraat Departure', start: '20261205T070000Z' },
    { id: 'walima', title: 'Walima Reception', start: '20261206T080000Z', end: '20261206T100000Z', location: 'Taj Mahal Marriage Hall' }
  ];
  const urduTitles = ['رسمِ مہندی', 'سہرا بندی', 'روانگیِ بارات', 'دعوتِ ولیمہ'];
  const urduLocations = { mehndi: 'رہائش گاہِ شہزاد احمد', walima: 'تاج محل میرج ہال' };
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Awais Ahmad Wedding//Invitation//EN', 'CALSCALE:GREGORIAN'];
  for (const [index, entry] of entries.entries()) {
    const title = page.lang === 'ur' ? urduTitles[index] : entry.title;
    const location = page.lang === 'ur' ? urduLocations[entry.id] : entry.location;
    lines.push('BEGIN:VEVENT', `UID:${entry.id}-awais-ahmad-december-2026`, `DTSTAMP:${timestamp}`,
      `DTSTART:${entry.start}`, `SUMMARY:${title}`);
    if (entry.end) lines.push(`DTEND:${entry.end}`);
    if (location) lines.push(`LOCATION:${location}`);
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR', '');
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
  const download = document.createElement('a');
  download.href = url;
  download.download = 'awais-ahmad-wedding.ics';
  document.body.append(download);
  download.click();
  download.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
