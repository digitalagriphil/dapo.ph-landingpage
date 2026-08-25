(function(){
  "use strict";

  /* ---------------- Theme toggle ---------------- */
  var root = document.documentElement;
  var stored = null;
  try{ stored = localStorage.getItem('dap-theme'); }catch(e){}
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var initial = stored || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', initial);

  function applyTheme(t){
    root.setAttribute('data-theme', t);
    try{ localStorage.setItem('dap-theme', t); }catch(e){}
    var btns = document.querySelectorAll('.theme-toggle');
    btns.forEach(function(b){ b.setAttribute('aria-pressed', t === 'dark'); });
  }
  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.theme-toggle').forEach(function(btn){
      btn.setAttribute('aria-pressed', initial === 'dark');
      btn.addEventListener('click', function(){
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(next);
      });
    });

    /* ---------------- User dropdown ---------------- */
    var chip = document.querySelector('.user-chip');
    var dropdown = document.querySelector('.user-dropdown');
    if(chip && dropdown){
      function closeDD(){
        dropdown.classList.remove('open');
        chip.setAttribute('aria-expanded','false');
      }
      chip.addEventListener('click', function(e){
        e.stopPropagation();
        var isOpen = dropdown.classList.toggle('open');
        chip.setAttribute('aria-expanded', isOpen);
      });
      document.addEventListener('click', function(e){
        if(!dropdown.contains(e.target) && !chip.contains(e.target)) closeDD();
      });
      document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeDD(); });

      dropdown.querySelectorAll('[data-action]').forEach(function(item){
        item.addEventListener('click', function(){
          var action = item.getAttribute('data-action');
          closeDD();
          if(action === 'logout'){
            if(confirm('Log out of Digital Agriculture Philippines?')){
              window.location.href = (window.SITE_ROOT || '') + 'index.html?loggedout=1';
            }
          } else {
            alert('Opening ' + item.querySelector('.label-text').textContent.trim() + ' \u2014 this is a demo interface.');
          }
        });
      });
    }

    /* ---------------- AI Agent widget ---------------- */
    var fab = document.querySelector('.ai-fab');
    var panel = document.querySelector('.ai-panel');
    var minBtn = document.querySelector('[data-ai="minimize"]');
    var closeBtn = document.querySelector('[data-ai="close"]');
    var body = document.querySelector('.ai-body');
    var form = document.querySelector('.ai-form');
    var input = form ? form.querySelector('input') : null;

    function openPanel(){
      panel.classList.add('open');
      panel.classList.remove('minimized');
      fab.setAttribute('aria-expanded','true');
    }
    function togglePanel(){
      if(panel.classList.contains('open') && !panel.classList.contains('minimized')){
        panel.classList.remove('open');
        fab.setAttribute('aria-expanded','false');
      } else {
        openPanel();
      }
    }
    if(fab && panel){
      fab.addEventListener('click', togglePanel);
      if(minBtn) minBtn.addEventListener('click', function(){
        panel.classList.toggle('minimized');
      });
      if(closeBtn) closeBtn.addEventListener('click', function(){
        panel.classList.remove('open');
        fab.setAttribute('aria-expanded','false');
      });
    }

    var replies = {
      livestock: "The Livestock module lets you log animal records, health checks, breeding history and production output. Tap the LIVESTOCK card on the homepage to open it.",
      crops: "Crops & Vegetables tracks planting schedules, inputs like seeds and fertilizer, and harvest volumes per plot.",
      fisheries: "Fisheries covers boat and fisherfolk registration, catch tracking, and access to coastal resource data.",
      dar: "DAR services cover land distribution records, agrarian reform beneficiary status, and support service requests.",
      landbank: "LANDBANK integration lets you check farmer loan status, accounts, and payment history.",
      gcash: "GCash lets you cash-in, cash-out, pay bills, and receive subsidy disbursements straight to your wallet.",
      transport: "Rural Transport helps you book schedules for moving people, livestock, and crops between barangays.",
      kadiwa: "KADIWA Sell connects you to public markets so you can list produce, see prices, and manage availability.",
      default: "I can help you find the right service \u2014 try asking about livestock, crops, fisheries, DAR, LANDBANK, GCash, rural transport, or KADIWA Sell."
    };

    function addMsg(text, who){
      var div = document.createElement('div');
      div.className = 'ai-msg ' + who;
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function respond(text){
      var lower = text.toLowerCase();
      var key = Object.keys(replies).find(function(k){ return k !== 'default' && lower.indexOf(k) !== -1; });
      addMsg(text, 'user');
      openPanel();
      setTimeout(function(){
        addMsg(replies[key] || replies.default, 'bot');
      }, 450);
    }

    document.querySelectorAll('.ai-quick button').forEach(function(b){
      b.addEventListener('click', function(){ respond(b.textContent.trim()); });
    });

    if(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        var val = input.value.trim();
        if(!val) return;
        respond(val);
        input.value = '';
      });
    }

    /* ---------------- Intro sequence ---------------- */
    var intro = document.querySelector('.intro');
    var pageContent = document.querySelector('.page-content');
    if(intro){
      document.body.classList.add('intro-active');
      var finished = false;
      function finishIntro(){
        if(finished) return;
        finished = true;
        intro.classList.add('hide');
        document.body.classList.remove('intro-active');
        if(pageContent) pageContent.classList.add('reveal');
        setTimeout(function(){ if(intro.parentNode) intro.parentNode.removeChild(intro); }, 950);
      }
      var timer = setTimeout(finishIntro, 7000);
      var skip = intro.querySelector('.intro-skip');
      if(skip){
        skip.addEventListener('click', function(){
          clearTimeout(timer);
          finishIntro();
        });
      }
    } else if(pageContent){
      pageContent.classList.add('reveal');
    }

    /* ---------------- Card stagger index ---------------- */
    document.querySelectorAll('.services-grid .service-card').forEach(function(card, i){
      card.style.setProperty('--i', i);
    });

    /* ---------------- Language switcher & i18n ---------------- */
    var LANGS = window.DAP_LANGS || ['en'];
    var DICT = window.DAP_I18N || {};
    var DICT_HTML = window.DAP_I18N_HTML || {};
    var langBtn = document.querySelector('.lang-btn');
    var langDropdown = document.querySelector('.lang-dropdown');
    var langCode = document.querySelector('.lang-code');
    var storedLang = null;
    try{ storedLang = localStorage.getItem('dap-lang'); }catch(e){}
    var currentLang = (storedLang && LANGS.indexOf(storedLang) !== -1) ? storedLang : 'en';

    function applyLanguage(lang){
      currentLang = LANGS.indexOf(lang) !== -1 ? lang : 'en';
      document.documentElement.setAttribute('lang', currentLang === 'en' ? 'en' : currentLang);
      try{ localStorage.setItem('dap-lang', currentLang); }catch(e){}

      document.querySelectorAll('[data-i18n]').forEach(function(el){
        var key = el.getAttribute('data-i18n');
        var val = (DICT[currentLang] && DICT[currentLang][key]) || (DICT.en && DICT.en[key]);
        if(val) el.textContent = val;
      });
      document.querySelectorAll('[data-i18n-html]').forEach(function(el){
        var key = el.getAttribute('data-i18n-html');
        var table = DICT_HTML[key];
        var val = table && (table[currentLang] || table.en);
        if(val) el.innerHTML = val;
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el){
        var key = el.getAttribute('data-i18n-placeholder');
        var val = (DICT[currentLang] && DICT[currentLang][key]) || (DICT.en && DICT.en[key]);
        if(val) el.setAttribute('placeholder', val);
      });

      if(langCode) langCode.textContent = currentLang.toUpperCase();
      document.querySelectorAll('.lang-chip').forEach(function(chip){
        chip.classList.toggle('active', chip.getAttribute('data-lang') === currentLang);
      });
    }
    window.DAP_applyLanguage = applyLanguage;

    if(langBtn && langDropdown){
      langBtn.addEventListener('click', function(e){
        e.stopPropagation();
        var isOpen = langDropdown.classList.toggle('open');
        langBtn.setAttribute('aria-expanded', isOpen);
      });
      document.addEventListener('click', function(e){
        if(!langDropdown.contains(e.target) && !langBtn.contains(e.target)){
          langDropdown.classList.remove('open');
          langBtn.setAttribute('aria-expanded','false');
        }
      });
      document.querySelectorAll('.lang-chip').forEach(function(chip){
        chip.addEventListener('click', function(){
          applyLanguage(chip.getAttribute('data-lang'));
          langDropdown.classList.remove('open');
          langBtn.setAttribute('aria-expanded','false');
        });
      });
    }
    applyLanguage(currentLang);
  });
})();
