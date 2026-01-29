// Module utilities and types
export interface ModuleContent {
  video_url?: string
  video_duration?: number
  quiz_questions?: QuizQuestion[]
  guided_questions?: GuidedQuestion[]
}

export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

export interface GuidedQuestion {
  id: number
  section: string
  question: string
  placeholder: string
  help_text: string
  example: string
  common_mistake: string
}

// Business Model Canvas content
export const businessModelCanvasContent: ModuleContent = {
  video_url: 'https://www.youtube.com/embed/QoAOzMTLP5s', // Business Model Canvas explained
  video_duration: 480, // 8 minutes
  
  quiz_questions: [
    {
      id: 1,
      question: "Qu'est-ce que le Business Model Canvas ?",
      options: [
        "Un document financier détaillé",
        "Un outil visuel pour décrire, concevoir et pivoter un modèle économique",
        "Un plan marketing complet",
        "Un organigramme d'entreprise"
      ],
      correct_answer: 1,
      explanation: "Le Business Model Canvas est un outil stratégique de management qui permet de décrire, concevoir, challenger et pivoter un modèle économique."
    },
    {
      id: 2,
      question: "Combien de blocs composent le Business Model Canvas ?",
      options: ["5 blocs", "7 blocs", "9 blocs", "12 blocs"],
      correct_answer: 2,
      explanation: "Le Business Model Canvas est composé de 9 blocs essentiels qui couvrent les 4 principales dimensions d'une entreprise : clients, offre, infrastructure et viabilité financière."
    },
    {
      id: 3,
      question: "Quel bloc décrit la valeur unique que votre entreprise apporte ?",
      options: [
        "Segments de clientèle",
        "Canaux de distribution",
        "Proposition de valeur",
        "Flux de revenus"
      ],
      correct_answer: 2,
      explanation: "La Proposition de Valeur décrit l'ensemble des produits et services qui créent de la valeur pour un segment de clientèle spécifique."
    },
    {
      id: 4,
      question: "Quelle est la différence entre 'Ressources Clés' et 'Activités Clés' ?",
      options: [
        "Il n'y a pas de différence",
        "Les ressources sont ce que vous possédez, les activités sont ce que vous faites",
        "Les ressources sont humaines, les activités sont financières",
        "Les activités viennent avant les ressources"
      ],
      correct_answer: 1,
      explanation: "Les Ressources Clés sont les actifs nécessaires (humains, physiques, intellectuels, financiers) tandis que les Activités Clés sont les actions importantes à entreprendre pour faire fonctionner le modèle."
    },
    {
      id: 5,
      question: "Pourquoi est-il important de définir les 'Segments de Clientèle' en premier ?",
      options: [
        "C'est une convention arbitraire",
        "Parce qu'il faut d'abord savoir qui sont vos clients pour leur proposer de la valeur",
        "Parce que c'est le bloc le plus facile",
        "Ce n'est pas important, on peut commencer par n'importe quel bloc"
      ],
      correct_answer: 1,
      explanation: "Identifier vos segments de clientèle est fondamental car tout votre modèle économique doit être construit autour des besoins et problèmes de vos clients cibles."
    }
  ],
  
  guided_questions: [
    {
      id: 1,
      section: "Segments de Clientèle",
      question: "Qui sont vos clients cibles ? Décrivez vos principaux segments de clientèle.",
      placeholder: "Ex: PME africaines du secteur agricole, femmes entrepreneures de 25-40 ans en milieu urbain...",
      help_text: "Un segment de clientèle représente un groupe de personnes ou d'organisations que votre entreprise souhaite atteindre et servir. Il est crucial de bien définir qui sont vos clients pour adapter votre offre à leurs besoins spécifiques.",
      example: "Exemple: 'Nos clients cibles sont les petites coopératives agricoles de 10-50 membres en Afrique de l'Ouest, qui cultivent des produits biologiques et cherchent à accéder aux marchés d'exportation.'",
      common_mistake: "Erreur fréquente : Dire 'tout le monde' ou 'les Africains'. Soyez spécifique : âge, localisation, secteur, taille, besoins particuliers."
    },
    {
      id: 2,
      section: "Proposition de Valeur",
      question: "Quelle valeur apportez-vous à vos clients ? Quel problème résolvez-vous ?",
      placeholder: "Ex: Nous facilitons l'accès au financement pour les entrepreneurs sans historique bancaire...",
      help_text: "Votre proposition de valeur est la raison pour laquelle les clients se tournent vers votre entreprise plutôt que vers une autre. Elle doit résoudre un problème client ou satisfaire un besoin client.",
      example: "Exemple: 'Nous offrons une plateforme digitale qui connecte les producteurs locaux directement aux restaurants, éliminant les intermédiaires et augmentant leurs marges de 30%.'",
      common_mistake: "Erreur fréquente : Décrire vos produits au lieu des bénéfices clients. Focalisez sur ce que le client GAGNE, pas ce que vous VENDEZ."
    },
    {
      id: 3,
      section: "Canaux de Distribution",
      question: "Comment atteignez-vous vos clients et leur livrez-vous votre proposition de valeur ?",
      placeholder: "Ex: Application mobile, agents terrain, WhatsApp Business, partenaires distributeurs...",
      help_text: "Les canaux décrivent comment votre entreprise communique avec ses segments de clientèle et les atteint pour leur délivrer sa proposition de valeur.",
      example: "Exemple: 'Phase 1: Vente directe via notre site web et application mobile. Phase 2: Partenariats avec des distributeurs locaux dans 5 villes. Phase 3: Réseau de revendeurs agréés.'",
      common_mistake: "Erreur fréquente : Confusion entre canal de communication (publicité) et canal de distribution (livraison). Précisez les deux."
    },
    {
      id: 4,
      section: "Relations Clients",
      question: "Quel type de relation établissez-vous avec chaque segment de clientèle ?",
      placeholder: "Ex: Assistance personnalisée, self-service, communauté, service automatisé...",
      help_text: "Décrivez les types de relations que vous établissez avec vos segments de clientèle : personnelle, automatisée, communautaire, co-création, etc.",
      example: "Exemple: 'Support client 24/7 via chatbot IA + hotline pour urgences. Programme de fidélité avec points. Communauté en ligne pour partage d'expériences.'",
      common_mistake: "Erreur fréquente : Oublier que la relation client a un coût. Équilibrez le niveau de service avec votre capacité opérationnelle."
    },
    {
      id: 5,
      section: "Flux de Revenus",
      question: "Comment générez-vous des revenus ? Quels sont vos sources de revenu et modèles de pricing ?",
      placeholder: "Ex: Abonnement mensuel, commission sur transactions, vente de produits, publicité...",
      help_text: "Les flux de revenus représentent l'argent qu'une entreprise génère de chaque segment de clientèle. Précisez le modèle de tarification et les montants.",
      example: "Exemple: 'Modèle freemium: Gratuit pour 50 premiers clients. Ensuite 15€/mois/utilisateur. Commission de 3% sur chaque transaction. Revenus publicitaires estimés à 5000€/mois.'",
      common_mistake: "Erreur fréquente : Confondre prix et valeur. Le prix doit refléter la valeur perçue par le client, pas seulement vos coûts + marge."
    },
    {
      id: 6,
      section: "Ressources Clés",
      question: "Quelles sont les ressources essentielles dont vous avez besoin (humaines, physiques, intellectuelles, financières) ?",
      placeholder: "Ex: Équipe de 5 développeurs, entrepôt de 500m², brevet technologique, capital de 100K€...",
      help_text: "Les ressources clés sont les actifs les plus importants requis pour faire fonctionner votre modèle économique. Pensez aux 4 catégories : physiques, intellectuelles, humaines et financières.",
      example: "Exemple: 'Humaines: 3 agronomes experts + 10 agents terrain. Physiques: 2 véhicules 4x4, 20 smartphones. Intellectuelles: Application mobile propriétaire. Financières: 50K€ fonds de roulement.'",
      common_mistake: "Erreur fréquente : Lister tout ce que vous avez au lieu de ce qui est CLÉ. Focalisez sur ce qui est vraiment indispensable et difficile à remplacer."
    },
    {
      id: 7,
      section: "Activités Clés",
      question: "Quelles sont les activités les plus importantes que vous devez réaliser pour faire fonctionner votre modèle ?",
      placeholder: "Ex: Développement logiciel, logistique, marketing digital, formation clients...",
      help_text: "Les activités clés sont les actions les plus importantes qu'une entreprise doit entreprendre pour faire fonctionner son modèle économique avec succès.",
      example: "Exemple: 'Production: Fabrication et contrôle qualité. Marketing: Campagnes digitales + événements B2B. Support: Formation clients + hotline. R&D: Amélioration continue produit.'",
      common_mistake: "Erreur fréquente : Confondre tâches quotidiennes et activités stratégiques. Les activités clés sont celles qui créent votre avantage compétitif."
    },
    {
      id: 8,
      section: "Partenaires Clés",
      question: "Qui sont vos partenaires et fournisseurs stratégiques ?",
      placeholder: "Ex: Fournisseurs de matières premières, banques partenaires, distributeurs, ONG locales...",
      help_text: "Les partenariats peuvent optimiser votre modèle, réduire les risques ou acquérir des ressources. Identifiez vos alliances stratégiques et vos principaux fournisseurs.",
      example: "Exemple: 'Fournisseurs: 3 grossistes certifiés pour matières premières. Partenaires tech: AWS pour hébergement cloud. Partenaires financiers: Orange Money pour paiements mobiles. ONG: Partenariat avec l'USAID pour formation.'",
      common_mistake: "Erreur fréquente : Oublier de mentionner POURQUOI ces partenaires sont clés. Expliquez la valeur ajoutée de chaque partenariat."
    },
    {
      id: 9,
      section: "Structure de Coûts",
      question: "Quels sont vos principaux coûts et comment sont-ils structurés ?",
      placeholder: "Ex: Salaires (40%), infrastructure cloud (15%), marketing (20%), logistique (15%), autres (10%)...",
      help_text: "La structure de coûts décrit tous les coûts encourus pour faire fonctionner le modèle économique. Identifiez les coûts fixes et variables les plus importants.",
      example: "Exemple: 'Coûts fixes mensuels: Salaires 15K€ + Loyer 2K€ + Logiciels 1K€ = 18K€. Coûts variables: Matières premières (40% du CA) + Livraison (5% du CA) + Commissions vendeurs (10% du CA).'",
      common_mistake: "Erreur fréquente : Sous-estimer les coûts indirects (admin, juridique, assurances). Ajoutez 15-20% de marge de sécurité."
    }
  ]
}
