// Dashboard utilities
export async function getUserWithProgress(db: D1Database, userId: number) {
  // Get user info
  const user = await db.prepare(`
    SELECT id, email, name, country, user_type, status, created_at
    FROM users
    WHERE id = ?
  `).bind(userId).first()

  if (!user) return null

  // Get user's project
  const project = await db.prepare(`
    SELECT id, name, description
    FROM projects
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 1
  `).bind(userId).first()

  // Get all modules
  const modules = await db.prepare(`
    SELECT id, module_code, title, description, step_number, estimated_time
    FROM modules
    WHERE is_active = 1
    ORDER BY step_number, display_order
  `).all()

  // Get user's progress
  const progress = await db.prepare(`
    SELECT module_id, status, quiz_score, quiz_passed, completed_at
    FROM progress
    WHERE user_id = ? AND project_id = ?
  `).bind(userId, project?.id || null).all()

  // Calculate overall progress
  const totalModules = modules.results.length
  const completedModules = progress.results.filter((p: any) => p.status === 'completed').length
  const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  // Determine current step (1-5)
  const completedSteps = new Set(
    progress.results
      .filter((p: any) => p.status === 'completed')
      .map((p: any) => {
        const module = modules.results.find((m: any) => m.id === p.module_id)
        return module?.step_number
      })
  )
  const currentStep = completedSteps.size + 1

  // Get next recommended module
  const nextModule = modules.results.find((m: any) => {
    const moduleProgress = progress.results.find((p: any) => p.module_id === m.id)
    return !moduleProgress || moduleProgress.status !== 'completed'
  })

  return {
    user,
    project,
    modules: modules.results,
    progress: progress.results,
    stats: {
      totalModules,
      completedModules,
      progressPercentage,
      currentStep,
      nextModule
    }
  }
}
