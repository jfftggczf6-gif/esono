// Mock AI feedback generator
export interface FeedbackItem {
  section: string
  type: 'strength' | 'suggestion' | 'question'
  message: string
  score: number // 1-5
}

export function generateMockFeedback(answers: Map<number, string>): FeedbackItem[] {
  const feedback: FeedbackItem[] = []
  
  // Analyze each section
  answers.forEach((answer, questionId) => {
    const section = getSectionName(questionId)
    const wordCount = answer.split(/\s+/).length
    
    // Generic feedback based on length and content
    if (wordCount < 20) {
      feedback.push({
        section,
        type: 'suggestion',
        message: `Votre description pourrait être plus détaillée. Essayez d'ajouter des exemples concrets et des chiffres.`,
        score: 2
      })
    } else if (wordCount > 100) {
      feedback.push({
        section,
        type: 'strength',
        message: `Description complète et détaillée. Excellente profondeur d'analyse.`,
        score: 5
      })
    } else {
      feedback.push({
        section,
        type: 'strength',
        message: `Bonne description avec un niveau de détail approprié.`,
        score: 4
      })
    }
    
    // Check for numbers/metrics
    if (/\d+/.test(answer)) {
      feedback.push({
        section,
        type: 'strength',
        message: `Très bien ! Vous avez inclus des chiffres et métriques concrètes.`,
        score: 5
      })
    } else if (questionId === 5 || questionId === 9) { // Revenue/Costs
      feedback.push({
        section,
        type: 'question',
        message: `Pouvez-vous quantifier ces éléments avec des montants ou pourcentages ?`,
        score: 3
      })
    }
    
    // Check for specificity
    if (answer.toLowerCase().includes('tout le monde') || answer.toLowerCase().includes('tous les')) {
      feedback.push({
        section,
        type: 'suggestion',
        message: `Évitez les termes trop génériques comme "tout le monde". Soyez plus spécifique sur votre cible.`,
        score: 2
      })
    }
  })
  
  return feedback
}

export function getSectionName(questionId: number): string {
  const sections: { [key: number]: string } = {
    1: 'Segments de Clientèle',
    2: 'Proposition de Valeur',
    3: 'Canaux de Distribution',
    4: 'Relations Clients',
    5: 'Flux de Revenus',
    6: 'Ressources Clés',
    7: 'Activités Clés',
    8: 'Partenaires Clés',
    9: 'Structure de Coûts'
  }
  return sections[questionId] || `Section ${questionId}`
}

export function calculateOverallScore(feedback: FeedbackItem[]): number {
  if (feedback.length === 0) return 0
  const totalScore = feedback.reduce((sum, item) => sum + item.score, 0)
  return Math.round((totalScore / (feedback.length * 5)) * 100)
}

export function getScoreLabel(score: number): { label: string, color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'green' }
  if (score >= 60) return { label: 'Bien', color: 'blue' }
  if (score >= 40) return { label: 'À améliorer', color: 'yellow' }
  return { label: 'Insuffisant', color: 'red' }
}
