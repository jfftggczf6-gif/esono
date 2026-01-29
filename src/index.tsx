import { Hono } from 'hono'
import { renderer } from './renderer'
import { cors } from 'hono/cors'
import { hashPassword, verifyPassword, generateToken, verifyToken } from './auth'
import { getCookie, setCookie } from 'hono/cookie'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use(renderer)
app.use('/api/*', cors())

// Landing Page - A1
app.get('/', (c) => {
  return c.render(
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div class="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div class="text-center mb-16">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mb-6 shadow-lg">
            <i class="fas fa-graduation-cap text-3xl text-white"></i>
          </div>
          <h1 class="text-5xl font-bold text-gray-900 mb-4">
            Transformez votre idée en entreprise finançable
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Une plateforme qui accompagne les entrepreneurs africains de l'apprentissage au financement
          </p>
        </div>

        {/* Main Question */}
        <div class="mb-12">
          <h2 class="text-3xl font-semibold text-center text-gray-800 mb-8">
            Quel est votre point de départ ?
          </h2>
        </div>

        {/* Choice Cards */}
        <div class="grid md:grid-cols-2 gap-8 mb-12">
          {/* Pre-entrepreneur Card */}
          <a href="/register?type=pre_entrepreneur" class="group block">
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-blue-500 h-full">
              <div class="flex flex-col h-full">
                <div class="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-6 group-hover:bg-blue-500 transition-colors">
                  <i class="fas fa-lightbulb text-3xl text-blue-600 group-hover:text-white transition-colors"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">
                  Je souhaite devenir entrepreneur
                </h3>
                <p class="text-gray-600 mb-6 flex-grow">
                  Découvrir l'entrepreneuriat, apprendre les fondamentaux et tester mes idées
                </p>
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <i class="fas fa-check text-blue-600 mt-1"></i>
                    <span class="text-sm text-gray-700">Formation pas à pas</span>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="fas fa-check text-blue-600 mt-1"></i>
                    <span class="text-sm text-gray-700">Validation de compétences</span>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="fas fa-check text-blue-600 mt-1"></i>
                    <span class="text-sm text-gray-700">Accompagnement IA & Coach</span>
                  </div>
                </div>
                <div class="mt-6 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Commencer l'apprentissage</span>
                  <i class="fas fa-arrow-right ml-2 group-hover:ml-4 transition-all"></i>
                </div>
              </div>
            </div>
          </a>

          {/* Entrepreneur Card */}
          <a href="/register?type=entrepreneur" class="group block">
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500 h-full">
              <div class="flex flex-col h-full">
                <div class="flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-6 group-hover:bg-green-500 transition-colors">
                  <i class="fas fa-rocket text-3xl text-green-600 group-hover:text-white transition-colors"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-4">
                  Je suis déjà entrepreneur
                </h3>
                <p class="text-gray-600 mb-6 flex-grow">
                  Structurer mon projet, crédibiliser mon entreprise et accéder au financement
                </p>
                <div class="space-y-3">
                  <div class="flex items-start gap-3">
                    <i class="fas fa-check text-green-600 mt-1"></i>
                    <span class="text-sm text-gray-700">Business Plan professionnel</span>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="fas fa-check text-green-600 mt-1"></i>
                    <span class="text-sm text-gray-700">Projections financières</span>
                  </div>
                  <div class="flex items-start gap-3">
                    <i class="fas fa-check text-green-600 mt-1"></i>
                    <span class="text-sm text-gray-700">Dossiers investisseurs</span>
                  </div>
                </div>
                <div class="mt-6 flex items-center text-green-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Structurer mon entreprise</span>
                  <i class="fas fa-arrow-right ml-2 group-hover:ml-4 transition-all"></i>
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Features Banner */}
        <div class="bg-white rounded-xl shadow-md p-6">
          <div class="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div class="text-3xl font-bold text-blue-600 mb-2">5 Étapes</div>
              <div class="text-sm text-gray-600">Parcours structuré</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-green-600 mb-2">IA + Coach</div>
              <div class="text-sm text-gray-600">Double validation</div>
            </div>
            <div>
              <div class="text-3xl font-bold text-purple-600 mb-2">100% Prêt</div>
              <div class="text-sm text-gray-600">Livrables investisseurs</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div class="text-center mt-12">
          <p class="text-gray-500 text-sm">
            Déjà inscrit ? <a href="/login" class="text-blue-600 hover:underline font-medium">Se connecter</a>
          </p>
        </div>
      </div>
    </div>
  )
})

// Register Page - A2
app.get('/register', (c) => {
  const userType = c.req.query('type') || 'entrepreneur'
  const isPreEntrepreneur = userType === 'pre_entrepreneur'
  
  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12 px-4">
      <div class="max-w-md mx-auto">
        {/* Header */}
        <div class="text-center mb-8">
          <a href="/" class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl mb-4 shadow-lg">
            <i class="fas fa-graduation-cap text-2xl text-white"></i>
          </a>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            {isPreEntrepreneur ? 'Commencer votre apprentissage' : 'Structurer votre entreprise'}
          </h1>
          <p class="text-gray-600">
            {isPreEntrepreneur 
              ? 'Créez votre compte pour accéder aux formations' 
              : 'Créez votre compte pour structurer votre projet'}
          </p>
        </div>

        {/* Registration Form */}
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <form id="registerForm" class="space-y-6">
            <input type="hidden" name="user_type" value={userType} />
            
            {/* Name */}
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Nom complet <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe <span class="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minlength="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <p class="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
            </div>

            {/* Country */}
            <div>
              <label for="country" class="block text-sm font-medium text-gray-700 mb-2">
                Pays <span class="text-red-500">*</span>
              </label>
              <select
                id="country"
                name="country"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un pays</option>
                <option value="SN">Sénégal</option>
                <option value="CI">Côte d'Ivoire</option>
                <option value="BF">Burkina Faso</option>
                <option value="ML">Mali</option>
                <option value="BJ">Bénin</option>
                <option value="TG">Togo</option>
                <option value="NE">Niger</option>
                <option value="CM">Cameroun</option>
                <option value="MA">Maroc</option>
                <option value="DZ">Algérie</option>
                <option value="TN">Tunisie</option>
                <option value="KE">Kenya</option>
                <option value="NG">Nigeria</option>
                <option value="GH">Ghana</option>
                <option value="RW">Rwanda</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
                Statut <span class="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionner un statut</option>
                <option value="student">Étudiant</option>
                <option value="entrepreneur">Entrepreneur</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>

            {/* Terms */}
            <div class="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                required
                class="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label for="terms" class="text-sm text-gray-600">
                J'accepte les conditions d'utilisation et la politique de confidentialité
              </label>
            </div>

            {/* Error message */}
            <div id="error-message" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"></div>

            {/* Submit Button */}
            <button
              type="submit"
              class={`w-full py-3 px-4 rounded-lg text-white font-semibold ${isPreEntrepreneur ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} transition-colors`}
            >
              <span id="submit-text">Créer mon compte</span>
              <span id="submit-loading" class="hidden">
                <i class="fas fa-spinner fa-spin mr-2"></i>Création en cours...
              </span>
            </button>
          </form>

          {/* Login Link */}
          <div class="text-center mt-6">
            <p class="text-gray-600 text-sm">
              Déjà inscrit ? <a href="/login" class="text-blue-600 hover:underline font-medium">Se connecter</a>
            </p>
          </div>
        </div>
      </div>

      <script src="/static/register.js"></script>
    </div>
  )
})

// Login Page
app.get('/login', (c) => {
  return c.render(
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div class="max-w-md w-full">
        {/* Header */}
        <div class="text-center mb-8">
          <a href="/" class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl mb-4 shadow-lg">
            <i class="fas fa-graduation-cap text-2xl text-white"></i>
          </a>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Bon retour !
          </h1>
          <p class="text-gray-600">
            Connectez-vous pour continuer votre parcours
          </p>
        </div>

        {/* Login Form */}
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <form id="loginForm" class="space-y-6">
            {/* Email */}
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {/* Error message */}
            <div id="error-message" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"></div>

            {/* Submit Button */}
            <button
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              <span id="submit-text">Se connecter</span>
              <span id="submit-loading" class="hidden">
                <i class="fas fa-spinner fa-spin mr-2"></i>Connexion...
              </span>
            </button>
          </form>

          {/* Register Link */}
          <div class="text-center mt-6">
            <p class="text-gray-600 text-sm">
              Pas encore de compte ? <a href="/" class="text-blue-600 hover:underline font-medium">S'inscrire</a>
            </p>
          </div>
        </div>
      </div>

      <script src="/static/login.js"></script>
    </div>
  )
})

// API: Register
app.post('/api/register', async (c) => {
  try {
    const { name, email, password, country, status, user_type } = await c.req.json()

    // Validate inputs
    if (!name || !email || !password || !country || !status || !user_type) {
      return c.json({ error: 'Tous les champs sont requis' }, 400)
    }

    if (password.length < 6) {
      return c.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, 400)
    }

    // Check if email already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first()

    if (existingUser) {
      return c.json({ error: 'Cet email est déjà utilisé' }, 400)
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Insert user
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, password_hash, name, country, user_type, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(email, passwordHash, name, country, user_type, status).run()

    // Create default project
    const userId = result.meta.last_row_id
    await c.env.DB.prepare(`
      INSERT INTO projects (user_id, name, description)
      VALUES (?, ?, ?)
    `).bind(userId, `Projet de ${name}`, 'Mon projet entrepreneurial').run()

    // Generate JWT token
    const token = await generateToken({
      userId: Number(userId),
      email,
      userType: user_type
    })

    setCookie(c, 'auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return c.json({
      success: true,
      user: { id: userId, name, email, userType: user_type }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return c.json({ error: 'Erreur lors de la création du compte' }, 500)
  }
})

// API: Login
app.post('/api/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email et mot de passe requis' }, 400)
    }

    // Find user
    const user = await c.env.DB.prepare(`
      SELECT id, email, password_hash, name, user_type
      FROM users
      WHERE email = ?
    `).bind(email).first()

    if (!user) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401)
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash as string)
    if (!isValid) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401)
    }

    // Generate JWT token
    const token = await generateToken({
      userId: user.id as number,
      email: user.email as string,
      userType: user.user_type as 'pre_entrepreneur' | 'entrepreneur'
    })

    setCookie(c, 'auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    })

    return c.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.user_type
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Erreur lors de la connexion' }, 500)
  }
})

// API: Logout
app.post('/api/logout', (c) => {
  setCookie(c, 'auth_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 0
  })
  return c.json({ success: true })
})

// API: Get current user
app.get('/api/user', async (c) => {
  try {
    const token = getCookie(c, 'auth_token')
    
    if (!token) {
      return c.json({ error: 'Non authentifié' }, 401)
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return c.json({ error: 'Token invalide' }, 401)
    }

    const user = await c.env.DB.prepare(`
      SELECT id, email, name, country, user_type, status, created_at
      FROM users
      WHERE id = ?
    `).bind(payload.userId).first()

    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404)
    }

    return c.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: 'Erreur serveur' }, 500)
  }
})

export default app
