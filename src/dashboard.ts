// Dashboard utilities — Architecture 8 modules
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

  // Get all active modules (includes new 8-module architecture)
  const modules = await db.prepare(`
    SELECT id, module_code, title, description, step_number, estimated_time,
           module_number, category, icon, color
    FROM modules
    WHERE is_active = 1
    ORDER BY COALESCE(module_number, step_number), display_order
  `).all()

  // Get user's progress
  const progress = await db.prepare(`
    SELECT module_id, status, quiz_score, quiz_passed, completed_at,
           ai_score, financial_score, coach_validated
    FROM progress
    WHERE user_id = ? AND project_id = ?
  `).bind(userId, project?.id || null).all()

  // Calculate overall progress
  const totalModules = modules.results.length
  const completedModules = progress.results.filter((p: any) => 
    p.status === 'completed' || p.status === 'validated'
  ).length
  const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  // Determine current step based on completed modules
  const completedModuleIds = new Set(
    progress.results
      .filter((p: any) => p.status === 'completed' || p.status === 'validated')
      .map((p: any) => p.module_id)
  )

  // Find next module to work on
  const nextModule = modules.results.find((m: any) => {
    return !completedModuleIds.has(m.id)
  })

  // Count by category
  const hybridModules = modules.results.filter((m: any) => m.category === 'hybrid')
  const autoModules = modules.results.filter((m: any) => m.category === 'automatic')
  const completedHybrid = hybridModules.filter((m: any) => completedModuleIds.has(m.id)).length
  const completedAuto = autoModules.filter((m: any) => completedModuleIds.has(m.id)).length

  return {
    user,
    project,
    modules: modules.results,
    progress: progress.results,
    stats: {
      totalModules,
      completedModules,
      progressPercentage,
      currentStep: completedModules + 1,
      nextModule,
      hybridTotal: hybridModules.length,
      hybridCompleted: completedHybrid,
      autoTotal: autoModules.length,
      autoCompleted: completedAuto
    }
  }
}
