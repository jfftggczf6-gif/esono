// Register form handler - robust version
(function() {
  'use strict';
  
  console.log('[Register] Script loaded');
  
  function initForm() {
    var form = document.getElementById('registerForm');
    var errorMessage = document.getElementById('error-message');
    var submitText = document.getElementById('submit-text');
    var submitLoading = document.getElementById('submit-loading');
    
    if (!form) {
      console.error('[Register] Form not found!');
      return;
    }
    
    console.log('[Register] Form found, attaching event listener');
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Hide error, show loading
      if (errorMessage) errorMessage.style.display = 'none';
      if (submitText) submitText.style.display = 'none';
      if (submitLoading) submitLoading.style.display = 'inline-flex';
      
      var formData = new FormData(form);
      var data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        country: formData.get('country'),
        status: formData.get('status'),
        user_type: formData.get('user_type')
      };
      
      fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      })
      .then(function(response) {
        return response.json().then(function(result) {
          return { ok: response.ok, result: result };
        });
      })
      .then(function(resp) {
        if (resp.ok && resp.result.success) {
          var token = resp.result.token || '';
          
          // Store token
          if (token) {
            try { localStorage.setItem('auth_token', token); } catch(e) {}
            document.cookie = 'auth_token=' + token + '; path=/; max-age=604800';
            try {
              document.cookie = 'auth_token=' + token + '; path=/; max-age=604800; SameSite=None; Secure';
            } catch(e) {}
          }
          
          // Redirect to entrepreneur page with token fallback
          window.location.href = '/entrepreneur?token=' + encodeURIComponent(token);
        } else {
          if (errorMessage) {
            errorMessage.textContent = resp.result.error || 'Une erreur est survenue';
            errorMessage.style.display = 'block';
          }
          if (submitText) submitText.style.display = 'inline-flex';
          if (submitLoading) submitLoading.style.display = 'none';
        }
      })
      .catch(function(error) {
        if (errorMessage) {
          errorMessage.textContent = 'Erreur de connexion au serveur. Veuillez réessayer.';
          errorMessage.style.display = 'block';
        }
        if (submitText) submitText.style.display = 'inline-flex';
        if (submitLoading) submitLoading.style.display = 'none';
        console.error('[Register] Error:', error);
      });
    });
    
    console.log('[Register] Event listener attached successfully');
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForm);
  } else {
    initForm();
  }
})();
