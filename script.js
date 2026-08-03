// Cart drawer
  (function(){
    var drawer = document.getElementById('cartDrawer');
    var overlay = document.getElementById('drawerOverlay');
    function open(){
      drawer.classList.add('open'); overlay.classList.add('open');
      if(typeof fbq === 'function'){ fbq('track', 'AddToCart'); }
    }
    function close(){ drawer.classList.remove('open'); overlay.classList.remove('open'); }
    document.getElementById('cartOpen').addEventListener('click', open);
    document.getElementById('drawerClose').addEventListener('click', close);
    overlay.addEventListener('click', close);
  })();

  // Fade-in on scroll
  (function(){
    var els = document.querySelectorAll('.fade-up');
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in-view'); }
      });
    }, {threshold:0.15});
    els.forEach(function(el){ obs.observe(el); });
  })();

  // Meta Pixel: InitiateCheckout ao clicar em qualquer botão de compra
  (function(){
    document.querySelectorAll('a.cta').forEach(function(btn){
      btn.addEventListener('click', function(){
        if(typeof fbq === 'function'){ fbq('track', 'InitiateCheckout'); }
      });
    });
  })();

  // Checkout modal (pop-up)
  (function(){
    var overlay = document.getElementById('checkoutOverlay');
    var modal = document.getElementById('checkoutModal');
    var closeBtn = document.getElementById('checkoutModalClose');
    var checkoutCta = document.getElementById('checkoutCta');

    function openModal(e){
      if(e) e.preventDefault();
      overlay.classList.add('open');
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal(){
      overlay.classList.remove('open');
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.js-open-checkout').forEach(function(btn){
      btn.addEventListener('click', openModal);
    });
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape'){ closeModal(); }
    });
    checkoutCta.addEventListener('click', function(){
      if(typeof fbq === 'function'){ fbq('track', 'AddPaymentInfo'); }
    });
  })();

  // Quiz de qualificação (tela cheia na entrada)
  (function(){
    var overlay = document.getElementById('quizIntro');
    if(!overlay) return;

    var answers = {};
    var steps = overlay.querySelectorAll('.quiz-step');
    var dots = overlay.querySelectorAll('.quiz-dot');
    var resultStep = overlay.querySelector('.quiz-result');
    var resultText = document.getElementById('quizResultText');
    var skipBtn = document.getElementById('quizSkipBtn');
    var continueBtn = document.getElementById('quizContinueBtn');
    var personalBanner = document.getElementById('quizPersonalBanner');

    var moduleByGoal = {
      errores: { name: 'Ley de Murphy', focus: 'a perderle el miedo a los errores y animarse a probar de nuevo' },
      curiosidad: { name: 'El Gran Libro de los Porqués', focus: 'a saciar su curiosidad con respuestas simples y divertidas' },
      liderazgo: { name: 'Pequeños Líderes', focus: 'a tomar la iniciativa y liderar con el ejemplo' },
    };

    document.body.classList.add('quiz-lock');

    function showStep(n){
      steps.forEach(function(s){ s.hidden = s.dataset.step !== String(n); });
      resultStep.hidden = true;
      dots.forEach(function(d){
        var dotN = parseInt(d.dataset.dot, 10);
        d.classList.toggle('active', dotN === n);
        d.classList.toggle('done', dotN < n);
      });
    }

    function showResult(){
      steps.forEach(function(s){ s.hidden = true; });
      dots.forEach(function(d){ d.classList.add('done'); d.classList.remove('active'); });
      resultStep.hidden = false;

      var mod = moduleByGoal[answers.meta] || moduleByGoal.curiosidad;
      var extra = '';
      if(answers.frustracion === 'seguido'){
        extra = ' Como notamos que a veces le cuesta manejar la frustración, este sistema le va a dar herramientas concretas para eso.';
      }
      if(answers.lectura === 'solo'){
        extra += ' Y como preferís que lea de forma independiente, los PDFs son perfectos para eso.';
      } else if(answers.lectura === 'juntos'){
        extra += ' Y como buscan compartir la lectura en familia, va a ser un lindo momento para conectar juntos.';
      }

      resultText.textContent =
        'Para un hijo de ' + (answers.edad || 'esa edad') + ', el módulo ideal es "' + mod.name +
        '" — pensado para ayudarlo ' + mod.focus + '. Viene incluido en tu Sistema de Aprendizaje 3X1, junto con los otros 2 módulos.' + extra;

      if(typeof fbq === 'function'){ fbq('track', 'Lead'); }
    }

    var portal = document.getElementById('portalTransition');

    function triggerPortal(x, y, callback){
      if(!portal){ callback(); return; }
      portal.style.setProperty('--px', x + 'px');
      portal.style.setProperty('--py', y + 'px');
      portal.classList.add('burst');
      setTimeout(function(){
        portal.classList.remove('burst');
      }, 950);
      setTimeout(callback, 420); // revela o site no meio da expansão do portal
    }

    function closeQuiz(){
      // se tiver resposta de meta, personaliza o banner do hero
      if(answers.meta && personalBanner){
        var mod = moduleByGoal[answers.meta] || moduleByGoal.curiosidad;
        personalBanner.textContent = '🎯 Recomendado para vos: ' + mod.name + (answers.edad ? ' (' + answers.edad + ')' : '');
        personalBanner.hidden = false;
      }
      overlay.classList.add('hide');
      document.body.classList.remove('quiz-lock');
      setTimeout(function(){
        overlay.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 700);
    }

    overlay.querySelectorAll('.quiz-opt').forEach(function(btn){
      btn.addEventListener('click', function(e){
        // efeito ripple no ponto do clique
        var rect = btn.getBoundingClientRect();
        var ripple = document.createElement('span');
        var size = Math.max(rect.width, rect.height);
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
        btn.appendChild(ripple);
        setTimeout(function(){ ripple.remove(); }, 600);

        var q = btn.dataset.q;
        var value = btn.dataset.value;
        answers[q] = value;

        var currentStepEl = btn.closest('.quiz-step');
        currentStepEl.querySelectorAll('.quiz-opt').forEach(function(o){
          o.classList.remove('selected');
        });
        btn.classList.add('selected');

        var currentStep = parseInt(currentStepEl.dataset.step, 10);
        setTimeout(function(){
          currentStepEl.classList.add('leaving');
          setTimeout(function(){
            currentStepEl.classList.remove('leaving');
            if(currentStep < steps.length){
              showStep(currentStep + 1);
            } else {
              showResult();
            }
          }, 280);
        }, 220);
      });
    });

    if(skipBtn){ skipBtn.addEventListener('click', closeQuiz); }
    if(continueBtn){
      continueBtn.addEventListener('click', function(e){
        var x = e.clientX || window.innerWidth/2;
        var y = e.clientY || window.innerHeight/2;
        triggerPortal(x, y, closeQuiz);
      });
    }


    showStep(1);
  })();



