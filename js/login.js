(function() {
  'use strict';
  const form = document.getElementById('login-form'), button = document.getElementById('submit'), error = document.getElementById('error');
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (button.disabled) return;
    button.disabled = true; error.textContent = '';
    try {
      const response = await fetch('/api/verify-auth', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({code:form.elements.code.value}), signal:AbortSignal.timeout(5000)});
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Anmeldung fehlgeschlagen.');
      const next = new URLSearchParams(location.search).get('next') || '/dashboard';
      location.replace(next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/dashboard');
    } catch (err) { error.textContent = err.message === 'TimeoutError' ? 'Die Anmeldung dauert zu lange. Bitte erneut versuchen.' : err.message; }
    finally { button.disabled = false; }
  });
}());
