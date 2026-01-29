// Login form handler
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm')
  const errorMessage = document.getElementById('error-message')
  const submitText = document.getElementById('submit-text')
  const submitLoading = document.getElementById('submit-loading')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    // Hide error message
    errorMessage.classList.add('hidden')

    // Show loading state
    submitText.classList.add('hidden')
    submitLoading.classList.remove('hidden')

    // Get form data
    const formData = new FormData(form)
    const data = {
      email: formData.get('email'),
      password: formData.get('password')
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        // Show error message
        errorMessage.textContent = result.error || 'Une erreur est survenue'
        errorMessage.classList.remove('hidden')

        // Reset button state
        submitText.classList.remove('hidden')
        submitLoading.classList.add('hidden')
      }
    } catch (error) {
      console.error('Login error:', error)
      errorMessage.textContent = 'Erreur de connexion au serveur'
      errorMessage.classList.remove('hidden')

      // Reset button state
      submitText.classList.remove('hidden')
      submitLoading.classList.add('hidden')
    }
  })
})
