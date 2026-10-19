
(function(){
  var d = document, root = d.documentElement;
  root.classList.add('js');

  /* ---------- TEMA ---------- */
  var themeBtn = d.getElementById('themeBtn');
  function isDark(){
    return root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme:dark)').matches;
  }
  function paintTheme(){
    themeBtn.textContent = isDark() ? '☀' : '☾';
    var themeLabels = {
      en: isDark() ? 'Switch to light mode' : 'Switch to dark mode',
      es: isDark() ? 'Activar modo claro' : 'Activar modo oscuro',
      fr: isDark() ? 'Activer le mode clair' : 'Activer le mode sombre',
      de: isDark() ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'
    };
    themeBtn.setAttribute('aria-label', themeLabels[root.lang] || themeLabels.en);
  }
  try{
    var st = localStorage.getItem('mk-theme');
    if (st) root.dataset.theme = st;
  }catch(e){}
  paintTheme();
  if (themeBtn) themeBtn.addEventListener('click', function(){
    var next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try{ localStorage.setItem('mk-theme', next); }catch(e){}
    paintTheme();
  });

  /* ---------- IDIOMA ---------- */
  var langBtn = d.getElementById('langBtn');
  var languages = ['en', 'es', 'fr', 'de'];
  var translations = window.MiKcaoLocaleData.translations;
  var staticTranslations = window.MiKcaoLocaleData.staticTranslations;
  var localizedTextNodes = new WeakMap();
  var localizedAttributes = new WeakMap();
  var languagePicker = null;
  var languageMenu = null;
  var languageOptions = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];
  function closeLanguageMenu(returnFocus){
    if (!languageMenu || languageMenu.hidden) return;
    languageMenu.hidden = true;
    langBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) langBtn.focus();
  }
  function paintLanguagePicker(lang){
    if (!langBtn) return;
    var selected = languageOptions.filter(function(option){ return option.code === lang; })[0] || languageOptions[0];
    langBtn.querySelector('.language-flag').textContent = selected.flag;
    langBtn.querySelector('.language-name').textContent = selected.name;
    langBtn.setAttribute('aria-label', lang === 'en' ? 'Choose language' : lang === 'es' ? 'Elegir idioma' : lang === 'fr' ? 'Choisir la langue' : 'Sprache auswählen');
    languageMenu.querySelectorAll('[data-language]').forEach(function(optionButton){
      var isSelected = optionButton.getAttribute('data-language') === lang;
      optionButton.setAttribute('aria-checked', String(isSelected));
      optionButton.querySelector('.language-check').textContent = isSelected ? '✓' : '';
    });
  }
  function setupLanguagePicker(){
    if (!langBtn) return;
    languagePicker = d.createElement('div');
    languagePicker.className = 'language-picker';
    langBtn.parentNode.insertBefore(languagePicker, langBtn);
    languagePicker.appendChild(langBtn);
    langBtn.classList.add('language-trigger');
    langBtn.setAttribute('aria-haspopup', 'menu');
    langBtn.setAttribute('aria-expanded', 'false');
    langBtn.setAttribute('aria-controls', 'language-menu');
    langBtn.replaceChildren();
    var flag = d.createElement('span');
    flag.className = 'language-flag';
    flag.setAttribute('aria-hidden', 'true');
    var name = d.createElement('span');
    name.className = 'language-name';
    var chevron = d.createElement('span');
    chevron.className = 'language-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '⌄';
    langBtn.append(flag, name, chevron);

    languageMenu = d.createElement('div');
    languageMenu.className = 'language-menu';
    languageMenu.id = 'language-menu';
    languageMenu.setAttribute('role', 'menu');
    languageMenu.hidden = true;
    languageOptions.forEach(function(option){
      var optionButton = d.createElement('button');
      optionButton.className = 'language-option';
      optionButton.type = 'button';
      optionButton.setAttribute('role', 'menuitemradio');
      optionButton.setAttribute('data-language', option.code);
      var optionFlag = d.createElement('span');
      optionFlag.className = 'language-flag';
      optionFlag.setAttribute('aria-hidden', 'true');
      optionFlag.textContent = option.flag;
      var optionName = d.createElement('span');
      optionName.className = 'language-option-name';
      optionName.textContent = option.name;
      var check = d.createElement('span');
      check.className = 'language-check';
      check.setAttribute('aria-hidden', 'true');
      optionButton.append(optionFlag, optionName, check);
      optionButton.addEventListener('click', function(){
        setLang(option.code);
        closeLanguageMenu(true);
      });
      optionButton.addEventListener('keydown', function(event){
        var index = languageOptions.findIndex(function(item){ return item.code === option.code; });
        if (event.key === 'Escape'){
          event.preventDefault();
          closeLanguageMenu(true);
        }else if (event.key === 'ArrowDown' || event.key === 'ArrowUp'){
          event.preventDefault();
          var offset = event.key === 'ArrowDown' ? 1 : -1;
          var next = languageOptions[(index + offset + languageOptions.length) % languageOptions.length];
          languageMenu.querySelector('[data-language="' + next.code + '"]').focus();
        }else if (event.key === 'Home' || event.key === 'End'){
          event.preventDefault();
          var edge = event.key === 'Home' ? languageOptions[0] : languageOptions[languageOptions.length - 1];
          languageMenu.querySelector('[data-language="' + edge.code + '"]').focus();
        }
      });
      languageMenu.appendChild(optionButton);
    });
    languagePicker.appendChild(languageMenu);
    langBtn.addEventListener('click', function(){
      var opening = languageMenu.hidden;
      languageMenu.hidden = !opening;
      langBtn.setAttribute('aria-expanded', String(opening));
      if (opening){
        var selected = languageMenu.querySelector('[aria-checked="true"]');
        if (selected) selected.focus();
      }
    });
    d.addEventListener('pointerdown', function(event){
      if (!languagePicker.contains(event.target)) closeLanguageMenu(false);
    });
    d.addEventListener('keydown', function(event){
      if (event.key === 'Escape' && !languageMenu.hidden) closeLanguageMenu(true);
    });
  }
  setupLanguagePicker();
  function setLang(lang){
    if (languages.indexOf(lang) === -1) lang = 'en';
    root.lang = lang;
    d.querySelectorAll('[data-es]').forEach(function(el){
      var spanish = el.getAttribute('data-es');
      var v = el.getAttribute('data-' + lang);
      if (v === null && translations[spanish] && lang === 'fr') v = translations[spanish][0];
      if (v === null && translations[spanish] && lang === 'de') v = translations[spanish][1];
      if (v === null || v === undefined) v = el.getAttribute('data-en') || spanish;
      el.innerHTML = v;
    });
    var textWalker = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT);
    var textNode;
    while ((textNode = textWalker.nextNode())){
      if (textNode.parentElement.closest('[data-es]')) continue;
      var original = localizedTextNodes.get(textNode) || textNode.nodeValue;
      var key = original.trim(), value = staticTranslations[key];
      if (!value) continue;
      localizedTextNodes.set(textNode, original);
      textNode.nodeValue = original.replace(key, value[lang] || value.en);
    }
    d.querySelectorAll('[aria-label],[alt],[placeholder],[title]').forEach(function(el){
      ['aria-label', 'alt', 'placeholder', 'title'].forEach(function(attribute){
        if (!el.hasAttribute(attribute)) return;
        var originalAttributes = localizedAttributes.get(el);
        if (!originalAttributes){
          originalAttributes = {};
          localizedAttributes.set(el, originalAttributes);
        }
        if (originalAttributes[attribute] === undefined) originalAttributes[attribute] = el.getAttribute(attribute);
        var value = staticTranslations[originalAttributes[attribute]];
        if (value) el.setAttribute(attribute, value[lang] || value.en);
      });
    });
    paintLanguagePicker(lang);
    var currentPage = d.body.getAttribute('data-current-page') || 'inicio';
    var pageMetadata = window.MiKcaoLocaleData.pageMetadata[currentPage];
    if (pageMetadata){
      d.title = pageMetadata.title[lang];
      var description = d.querySelector('meta[name="description"]');
      if (description) description.content = pageMetadata.description[lang];
      var openGraphDescription = d.querySelector('meta[property="og:description"]');
      if (openGraphDescription) openGraphDescription.content = pageMetadata.description[lang];
    }
    paintTheme();
    try{ localStorage.setItem('mk-lang', lang); }catch(e){}
  }
  var savedLang = 'en';
  try{ savedLang = localStorage.getItem('mk-lang') || 'en'; }catch(e){}
  setLang(savedLang);
  if (langBtn) langBtn.addEventListener('click', function(){
    setLang(languages[(languages.indexOf(root.lang) + 1) % languages.length]);
  });

  /* ---------- NAVEGACIÓN MULTIPÁGINA ---------- */
  var currentPage = d.body.getAttribute('data-current-page') || 'inicio';
  d.querySelectorAll('[data-nav]').forEach(function(a){
    var file = currentPage === 'inicio' ? 'index.html' : currentPage + '.html';
    if (a.getAttribute('href') === file) a.classList.add('is-active');
  });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){
        var sibs = [].slice.call(en.target.parentNode.querySelectorAll('.rv'));
        var i = sibs.indexOf(en.target);
        en.target.style.transitionDelay = ((i % 3) * 90) + 'ms';
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: .12 });
  function observeReveals(){
    d.querySelectorAll('.rv:not(.in)').forEach(function(el){ io.observe(el); });
  }
  function countUp(){
    var nums = d.querySelectorAll('[data-count]');
    if (!nums.length) return;
    var seen = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        var el = en.target, target = parseInt(el.dataset.count, 10), start = performance.now();
        (function tick(t){
          var p = Math.min((t - start) / 1600, 1);
          var e = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(target * e);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        })(start);
        seen.unobserve(el);
      });
    }, { threshold: .6 });
    nums.forEach(function(n){ seen.observe(n); });
  }
  /* ---------- PROGRESO DE LECTURA ---------- */
  var prog = d.getElementById('prog');
  function progress(){
    var h = d.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', progress, { passive: true });
  window.addEventListener('resize', progress);
  progress();

  /* ---------- ESTADO ABIERTO ---------- */
  function setStatus(){
    var el = d.getElementById('status');
    var txt = el.querySelector('.txt');
    var now, day, h;
    try{
      now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
    }catch(e){ now = new Date(); }
    day = now.getDay();
    h = now.getHours() + now.getMinutes() / 60;
    var open = day >= 1 && day <= 6 && h >= 9 && h < 21;
    el.classList.toggle('closed', !open);
    var statusText = {
      en: open ? 'Open now' : 'Closed now',
      es: open ? 'Abierto ahora' : 'Cerrado ahora',
      fr: open ? 'Ouvert actuellement' : 'Fermé actuellement',
      de: open ? 'Jetzt geöffnet' : 'Jetzt geschlossen'
    };
    txt.textContent = statusText[root.lang] || statusText.en;
  }
  setStatus();
  setInterval(function(){ setStatus(); }, 60000);

  /* ---------- TABS CARTA ---------- */
  var tabs = [].slice.call(d.querySelectorAll('.tab'));
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){
        var panel = d.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', 'false');
        if (panel) panel.hidden = true;
      });
      tab.setAttribute('aria-selected', 'true');
      var target = d.getElementById(tab.getAttribute('aria-controls'));
      if (target){
        target.hidden = false;
        target.style.animation = 'none';
        void target.offsetWidth;
        target.style.animation = '';
      }
    });
  });

  /* ---------- SPOTLIGHT EN TARJETAS ---------- */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches){
    d.addEventListener('pointermove', function(e){
      var card = e.target.closest ? e.target.closest('.card') : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }, { passive: true });
  }

  /* ---------- COTIZACIÓN MAYORISTAS ---------- */
  var quoteBtn = d.getElementById('quoteBtn');
  if (quoteBtn){
    quoteBtn.addEventListener('click', function(e){
      e.preventDefault();
      var g = function(id){ var el = d.getElementById(id); return el ? el.value.trim() : ''; };
      var msg = 'Cotización Mi Kcao\n'
        + 'Nombre: ' + g('q-nombre') + '\n'
        + 'Empresa: ' + g('q-empresa') + '\n'
        + 'País: ' + g('q-pais') + '\n'
        + 'Producto: ' + g('q-producto') + '\n'
        + 'Cantidad: ' + g('q-cantidad') + '\n'
        + 'Mensaje: ' + g('q-mensaje');
      window.open('https://wa.me/51991127756?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }

  /* ---------- INIT ---------- */
  observeReveals();
  countUp();
})();
