(function () {
  const healthNode = document.querySelector('[data-health]');
  const feedbackNode = document.querySelector('[data-feedback]');
  const emailInput = document.querySelector('[data-demo-email]');
  const demoTrigger = document.querySelector('[data-demo-trigger]');

  const contactHint = document.querySelector('.contact-hint');
  const contactSection = document.getElementById('contact');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu = document.querySelector('[data-nav-menu]');
  const navLinks = document.querySelectorAll('[data-nav-link]');
  const leadForm = document.querySelector('[data-lead-form]');
  const leadResult = document.querySelector('[data-lead-result]');
  const consentBanner = document.querySelector('[data-consent-banner]');
  const consentAccept = document.querySelector('[data-consent-accept]');
  const consentDecline = document.querySelector('[data-consent-decline]');
  const CONSENT_KEY = 'cybersim-consent-v1';
  let analyticsLoaded = false;
  let runtimeConfig = {
    segmentWriteKey: null,
    gtmId: null,
    calendlyUrl: 'https://calendly.com/cybersimpro/demo',
    stripeCheckoutUrl: null,
    featureFlags: {
      selfServiceCheckout: false,
      workflowAutomations: false,
    },
  };

  if (leadResult && !leadResult.dataset.tone) {
    leadResult.dataset.tone = 'info';
  }


  const setHealth = (text, tone = 'neutral') => {
    if (!healthNode) return;
    healthNode.textContent = text;
    healthNode.dataset.tone = tone;
  };

  const setFeedback = (message, tone = 'info') => {
    if (!feedbackNode) return;
    feedbackNode.textContent = message;
    feedbackNode.dataset.tone = tone;
  };

  const checkHealth = async () => {
    try {
      const res = await fetch('/health', { method: 'GET' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setHealth(`Status: MCP bridge healthy (${json.status ?? 'ok'})`, 'success');
    } catch (error) {
      setHealth('Status: unable to reach MCP bridge', 'error');
    }
  };

  const triggerDemoScenario = async () => {
    if (!demoTrigger) return;
    const email = emailInput?.value.trim();
    if (!email) {
      setFeedback('Add your email so we can tailor the scenario preview.', 'warn');
      emailInput?.focus();
      return;
    }

    setFeedback('Generating a tailored demo scenario…', 'info');
    demoTrigger.disabled = true;

    try {
      const response = await fetch('/tool/create_scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ransomware',
          difficulty: 'advanced',
          environment: 'corporate',
          sector: 'finance',
          operator: { id: 'demo-front', role: 'analyst' },
          metadata: { requestedBy: email },
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || `HTTP ${response.status}`);
      }

      const scenario = await response.json();
      setFeedback(`Scenario ${scenario?.id ?? 'generated'} created—check your MCP client for details.`, 'success');
      emailInput.value = '';
    } catch (error) {
      setFeedback(`Could not create a demo scenario. ${error instanceof Error ? error.message : ''}`, 'error');
    } finally {
      demoTrigger.disabled = false;
    }
  };

  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('config.json', { cache: 'no-store' });
      if (response.ok) {
        const config = await response.json();
        runtimeConfig = { ...runtimeConfig, ...config };
      }
    } catch (error) {
      console.warn('Could not load config.json', error);
    }

    document.querySelectorAll('[data-calendly-link]').forEach((link) => {
      if (runtimeConfig.calendlyUrl) {
        link.href = runtimeConfig.calendlyUrl;
      }
    });

    document.querySelectorAll('[data-checkout-url]').forEach((button) => {
      if (runtimeConfig.stripeCheckoutUrl && button.dataset.checkoutUrl?.includes('__STRIPE_CHECKOUT_URL__')) {
        button.dataset.checkoutUrl = runtimeConfig.stripeCheckoutUrl;
      }
    });

    checkHealth();
    if (demoTrigger) {
      demoTrigger.addEventListener('click', (event) => {
        event.preventDefault();
        triggerDemoScenario();
      });
    }

    const closeNav = () => {
      navMenu?.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };

    const toggleNav = () => {
      if (!navMenu || !navToggle) return;
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      const nextState = !expanded;
      navToggle.setAttribute('aria-expanded', String(nextState));
      navMenu.classList.toggle('is-open', nextState);
      document.body.classList.toggle('nav-open', nextState);
      if (nextState) {
        navMenu.querySelector('a, button')?.focus({ preventScroll: true });
      }
    };

    navToggle?.addEventListener('click', toggleNav);

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeNav();
      });
    });

    document.addEventListener('click', (event) => {
      if (!navMenu || !navToggle) return;
      if (!navMenu.classList.contains('is-open')) return;
      if (navMenu.contains(event.target) || navToggle.contains(event.target)) return;
      closeNav();
    }, { capture: true });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeNav();
      }
    });

    window.matchMedia('(min-width: 969px)').addEventListener('change', (event) => {
      if (event.matches) {
        closeNav();
      }
    });

    const focusContact = (message) => {
      contactSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (contactHint && message) {
        contactHint.textContent = message;
      }
    };

    document.querySelectorAll('[data-checkout-url]').forEach((button) => {
      if (!runtimeConfig.featureFlags.selfServiceCheckout) {
        button.dataset.checkoutUrl = '__STRIPE_CHECKOUT_URL__';
      }
      button.addEventListener('click', (event) => {
        const plan = button.dataset.plan ?? 'your plan';
        const checkoutUrl = button.dataset.checkoutUrl;
        if (checkoutUrl && !checkoutUrl.includes('__STRIPE_CHECKOUT_URL__')) {
          window.open(checkoutUrl, '_blank', 'noopener');
          return;
        }
        event.preventDefault();
        focusContact(`Stripe checkout for the ${plan} bundle is coming soon. We’ll route you to sales so you can activate the pilot today.`);
      });
    });

    document.querySelectorAll('[data-pricing-sheet]').forEach((link) => {
      link.addEventListener('click', () => {
        focusContact('We’ll email the pricing sheet once you share a work email.');
      });
    });

    const setLeadResult = (message, tone = 'info') => {
      if (!leadResult) return;
      leadResult.textContent = message;
      leadResult.dataset.tone = tone;
    };

    const submitLead = async (event) => {
      event.preventDefault();
      if (!leadForm) return;
      const formData = new FormData(leadForm);
      const payload = Object.fromEntries(formData.entries());
      setLeadResult('Sending details to the sales team…');

      try {
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error?.error || `HTTP ${response.status}`);
        }

        setLeadResult('Thanks! A strategist will be in touch within one business day.', 'success');
        leadForm.reset();
      } catch (error) {
        console.error('Lead capture error', error);
        setLeadResult('We could not send the request automatically. Email sales@cybersimpro.com and we will help right away.', 'error');
      }
    };

    leadForm?.addEventListener('submit', submitLead);

    const loadAnalytics = () => {
      if (analyticsLoaded) return;
      const config = runtimeConfig;

      if (config.segmentWriteKey) {
        const segmentScript = document.createElement('script');
        segmentScript.src = `https://cdn.segment.com/analytics.js/v1/${config.segmentWriteKey}/analytics.min.js`;
        segmentScript.async = true;
        document.head.appendChild(segmentScript);
      }

      if (config.gtmId) {
        const gtmScript = document.createElement('script');
        gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${config.gtmId}`;
        gtmScript.async = true;
        document.head.appendChild(gtmScript);
      }

      analyticsLoaded = true;
    };

    const storedConsent = localStorage.getItem(CONSENT_KEY);
    if (storedConsent === 'accepted') {
      loadAnalytics();
    } else if (consentBanner) {
      consentBanner.hidden = false;
    }

    const handleConsent = (decision) => {
      localStorage.setItem(CONSENT_KEY, decision);
      if (decision === 'accepted') {
        loadAnalytics();
      }
      if (consentBanner) {
        consentBanner.hidden = true;
      }
    };

    consentAccept?.addEventListener('click', () => handleConsent('accepted'));
    consentDecline?.addEventListener('click', () => handleConsent('declined'));
  });
})();
