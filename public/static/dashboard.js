// Dashboard utilities
async function logout() {
  try {
    await fetch('/api/logout', { method: 'POST' })
    window.location.href = '/'
  } catch (error) {
    console.error('Logout error:', error)
    window.location.href = '/'
  }
}

// Make logout function available globally
window.logout = logout
