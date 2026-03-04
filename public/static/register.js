// Register form handler - with role support
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
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
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
        user_type: formData.get('user_type'),
        role: formData.get('role') || 'entrepreneur'
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
          var role = (resp.result.user && resp.result.user.role) || data.role;
          
          // Store token
          if (token) {
            try { localStorage.setItem('auth_token', token); } catch(e) {}
            document.cookie = 'auth_token=' + token + '; path=/; max-age=604800';
            try {
              document.cookie = 'auth_token=' + token + '; path=/; max-age=604800; SameSite=None; Secure';
            } catch(e) {}
          }
          
          // Store role
          try { localStorage.setItem('esono_role', role); } catch(e) {}
          
          // Redirect based on role
          if (role === 'coach') {
            window.location.href = '/coach/dashboard';
          } else {
            window.location.href = '/entrepreneur?token=' + encodeURIComponent(token);
          }
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
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForm);
  } else {
    initForm();
  }
})();
