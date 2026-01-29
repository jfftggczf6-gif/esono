import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { verifyToken } from './auth'
import { businessModelCanvasContent } from './module-content'

type Bindings = {
  DB: D1Database
}

export const moduleRoutes = new Hono<{ Bindings: Bindings }>()

// B1 - Écran vidéo pédagogique
moduleRoutes.get('/module/:code/video', async (c) => {
  try {
    const token = getCookie(c, 'auth_token')
    if (!token) return c.redirect('/login')

    const payload = await verifyToken(token)
    if (!payload) return c.redirect('/login')

    const moduleCode = c.req.param('code')
    
    const module = await c.env.DB.prepare(`
      SELECT * FROM modules WHERE module_code = ?
    `).bind(moduleCode).first()

    if (!module) return c.redirect('/dashboard')

    // Get or create progress
    const progress = await c.env.DB.prepare(`
      SELECT * FROM progress 
      WHERE user_id = ? AND module_id = ?
    `).bind(payload.userId, module.id).first()

    if (!progress) {
      await c.env.DB.prepare(`
        INSERT INTO progress (user_id, module_id, status, started_at)
        VALUES (?, ?, 'in_progress', datetime('now'))
      `).bind(payload.userId, module.id).run()
    }

    // Get content based on module
    const content = moduleCode === 'step1_business_model' ? businessModelCanvasContent : null
    if (!content || !content.video_url) {
      return c.redirect(`/module/${moduleCode}`)
    }

    return c.html(
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{module.title as string} - Vidéo</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
          <link href="/static/style.css" rel="stylesheet" />
        </head>
        <body class="bg-gray-50">
          <div class="min-h-screen py-8 px-4">
            <div class="max-w-5xl mx-auto">
              {/* Header */}
              <div class="mb-6 flex items-center justify-between">
                <a href="/dashboard" class="text-blue-600 hover:text-blue-700 font-medium">
                  <i class="fas fa-arrow-left mr-2"></i>Retour au dashboard
                </a>
                <div class="text-sm text-gray-600">
                  <i class="fas fa-video mr-2"></i>Étape 1/7 - Vidéo pédagogique
                </div>
              </div>

              {/* Progress Bar */}
              <div class="mb-8 bg-white rounded-lg shadow-sm p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Progression du module</span>
                  <span class="text-sm text-gray-600">1/7</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" style="width: 14%"></div>
                </div>
              </div>

              {/* Main Content */}
              <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Title */}
                <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                  <h1 class="text-2xl font-bold mb-2">{module.title as string}</h1>
                  <p class="text-blue-100">{module.description as string}</p>
                </div>

                {/* Video Player */}
                <div class="p-6">
                  <div class="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                    <iframe
                      width="100%"
                      height="100%"
                      src={content.video_url}
                      title="Vidéo pédagogique"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  </div>

                  {/* Video Info */}
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div class="flex items-start gap-3">
                      <i class="fas fa-info-circle text-blue-600 mt-1"></i>
                      <div>
                        <h3 class="font-semibold text-gray-900 mb-2">Objectifs de cette vidéo</h3>
                        <ul class="text-sm text-gray-700 space-y-1">
                          <li>• Comprendre les 9 blocs du Business Model Canvas</li>
                          <li>• Apprendre à cartographier votre modèle économique</li>
                          <li>• Identifier les liens entre les différents blocs</li>
                          <li>• Préparer votre réflexion stratégique</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Key Points */}
                  <div class="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 class="font-semibold text-gray-900 mb-4">Points clés à retenir</h3>
                    <div class="grid md:grid-cols-2 gap-4">
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i class="fas fa-users text-blue-600"></i>
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900 mb-1">Clients</h4>
                          <p class="text-sm text-gray-600">Identifiez précisément vos segments de clientèle cibles</p>
                        </div>
                      </div>
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i class="fas fa-gift text-green-600"></i>
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900 mb-1">Valeur</h4>
                          <p class="text-sm text-gray-600">Définissez votre proposition de valeur unique</p>
                        </div>
                      </div>
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i class="fas fa-route text-purple-600"></i>
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900 mb-1">Canaux</h4>
                          <p class="text-sm text-gray-600">Choisissez vos canaux de distribution et communication</p>
                        </div>
                      </div>
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i class="fas fa-dollar-sign text-yellow-600"></i>
                        </div>
                        <div>
                          <h4 class="font-medium text-gray-900 mb-1">Revenus</h4>
                          <p class="text-sm text-gray-600">Déterminez vos sources de revenus</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Next Step Button */}
                  <div class="flex items-center justify-between">
                    <div class="text-sm text-gray-600">
                      <i class="far fa-clock mr-2"></i>
                      Durée estimée : {Math.floor(content.video_duration! / 60)} minutes
                    </div>
                    <a
                      href={`/module/${moduleCode}/quiz`}
                      class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
                    >
                      Passer au quiz
                      <i class="fas fa-arrow-right"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    )
  } catch (error) {
    console.error('Video error:', error)
    return c.redirect('/dashboard')
  }
})

// B2 - Quiz de validation
moduleRoutes.get('/module/:code/quiz', async (c) => {
  try {
    const token = getCookie(c, 'auth_token')
    if (!token) return c.redirect('/login')

    const payload = await verifyToken(token)
    if (!payload) return c.redirect('/login')

    const moduleCode = c.req.param('code')
    
    const module = await c.env.DB.prepare(`
      SELECT * FROM modules WHERE module_code = ?
    `).bind(moduleCode).first()

    if (!module) return c.redirect('/dashboard')

    const content = moduleCode === 'step1_business_model' ? businessModelCanvasContent : null
    if (!content || !content.quiz_questions) {
      return c.redirect(`/module/${moduleCode}`)
    }

    return c.html(
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{module.title as string} - Quiz</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
          <link href="/static/style.css" rel="stylesheet" />
        </head>
        <body class="bg-gray-50">
          <div class="min-h-screen py-8 px-4">
            <div class="max-w-4xl mx-auto">
              {/* Header */}
              <div class="mb-6 flex items-center justify-between">
                <a href="/dashboard" class="text-blue-600 hover:text-blue-700 font-medium">
                  <i class="fas fa-arrow-left mr-2"></i>Retour au dashboard
                </a>
                <div class="text-sm text-gray-600">
                  <i class="fas fa-question-circle mr-2"></i>Étape 2/7 - Quiz de validation
                </div>
              </div>

              {/* Progress Bar */}
              <div class="mb-8 bg-white rounded-lg shadow-sm p-4">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700">Progression du module</span>
                  <span class="text-sm text-gray-600">2/7</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-600 h-2 rounded-full" style="width: 29%"></div>
                </div>
              </div>

              {/* Main Content */}
              <div class="bg-white rounded-xl shadow-lg p-8">
                <div class="mb-8">
                  <h1 class="text-2xl font-bold text-gray-900 mb-2">Quiz de Validation</h1>
                  <p class="text-gray-600">
                    Répondez à ces 5 questions pour valider votre compréhension du Business Model Canvas.
                    Vous devez obtenir au moins 80% de bonnes réponses pour continuer.
                  </p>
                </div>

                {/* Quiz Form */}
                <form id="quizForm" class="space-y-8">
                  {content.quiz_questions!.map((q, index) => (
                    <div class="border-b border-gray-200 pb-8 last:border-0">
                      <div class="flex items-start gap-3 mb-4">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span class="text-blue-600 font-bold">{index + 1}</span>
                        </div>
                        <div class="flex-1">
                          <h3 class="font-semibold text-gray-900 mb-4">{q.question}</h3>
                          <div class="space-y-3">
                            {q.options.map((option, optIndex) => (
                              <label class="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name={`question_${q.id}`}
                                  value={optIndex}
                                  required
                                  class="mt-1 w-4 h-4 text-blue-600"
                                />
                                <span class="text-gray-700">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div id={`explanation_${q.id}`} class="hidden mt-4 ml-11 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p class="text-sm text-gray-700">{q.explanation}</p>
                      </div>
                    </div>
                  ))}

                  {/* Results */}
                  <div id="quizResults" class="hidden">
                    <div id="successMessage" class="hidden bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                      <div class="flex items-start gap-3">
                        <i class="fas fa-check-circle text-2xl text-green-600"></i>
                        <div>
                          <h3 class="font-bold text-green-900 mb-2">Félicitations ! 🎉</h3>
                          <p class="text-green-800 mb-4">
                            Vous avez obtenu <span id="scoreValue" class="font-bold"></span>%.
                            Vous pouvez maintenant passer à l'étape suivante.
                          </p>
                          <a
                            href={`/module/${moduleCode}/questions`}
                            class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                          >
                            Continuer vers les questions guidées
                            <i class="fas fa-arrow-right"></i>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div id="failMessage" class="hidden bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                      <div class="flex items-start gap-3">
                        <i class="fas fa-times-circle text-2xl text-red-600"></i>
                        <div>
                          <h3 class="font-bold text-red-900 mb-2">Pas tout à fait...</h3>
                          <p class="text-red-800 mb-4">
                            Vous avez obtenu <span id="scoreValueFail" class="font-bold"></span>%.
                            Vous devez obtenir au moins 80% pour continuer. Revoyez la vidéo et réessayez.
                          </p>
                          <button
                            type="button"
                            onclick="window.location.reload()"
                            class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                          >
                            <i class="fas fa-redo"></i>
                            Recommencer le quiz
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div id="submitSection" class="flex justify-end">
                    <button
                      type="submit"
                      class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Valider mes réponses
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <script dangerouslySetInnerHTML={{__html: `
            const quizData = ${JSON.stringify(content.quiz_questions)};
            const moduleCode = '${moduleCode}';
            const form = document.getElementById('quizForm');
            
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              
              // Calculate score
              let correct = 0;
              const total = quizData.length;
              
              quizData.forEach(q => {
                const selected = document.querySelector('input[name="question_' + q.id + '"]:checked');
                if (selected && parseInt(selected.value) === q.correct_answer) {
                  correct++;
                }
                
                // Show explanation
                document.getElementById('explanation_' + q.id).classList.remove('hidden');
                
                // Highlight correct/incorrect
                const options = document.querySelectorAll('input[name="question_' + q.id + '"]');
                options.forEach((opt, idx) => {
                  const label = opt.closest('label');
                  if (idx === q.correct_answer) {
                    label.classList.add('border-green-500', 'bg-green-50');
                    label.classList.remove('border-gray-200');
                  } else if (opt.checked) {
                    label.classList.add('border-red-500', 'bg-red-50');
                    label.classList.remove('border-gray-200');
                  }
                });
              });
              
              const score = Math.round((correct / total) * 100);
              
              // Save score
              try {
                await fetch('/api/module/quiz', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    module_code: moduleCode,
                    score: score,
                    passed: score >= 80,
                    answers: Array.from(form.elements).filter(e => e.type === 'radio' && e.checked).map(e => e.value)
                  })
                });
              } catch (err) {
                console.error('Error saving quiz:', err);
              }
              
              // Show results
              document.getElementById('quizResults').classList.remove('hidden');
              document.getElementById('submitSection').classList.add('hidden');
              
              if (score >= 80) {
                document.getElementById('successMessage').classList.remove('hidden');
                document.getElementById('scoreValue').textContent = score;
              } else {
                document.getElementById('failMessage').classList.remove('hidden');
                document.getElementById('scoreValueFail').textContent = score;
              }
              
              // Scroll to results
              document.getElementById('quizResults').scrollIntoView({ behavior: 'smooth' });
            });
          `}} />
        </body>
      </html>
    )
  } catch (error) {
    console.error('Quiz error:', error)
    return c.redirect('/dashboard')
  }
})
