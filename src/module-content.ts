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

// Rapport d'activité structuré
export const activityReportContent: ModuleContent = {
  video_url: 'https://www.youtube.com/embed/xbmDXLI4Lk0',
  video_duration: 600,
  quiz_questions: [
    {
      id: 1,
      question: "Quel est l'objectif principal d'un rapport d'activité investisseur ?",
      options: [
        'Présenter uniquement les résultats financiers',
        'Structurer votre activité autour du problème, de la solution, du marché et de l’exécution',
        'Lister les réalisations de l’équipe',
        'Promouvoir la marque sur les réseaux sociaux'
      ],
      correct_answer: 1,
      explanation: 'Un rapport d’activité crédible doit rassurer sur la compréhension du problème, la pertinence de la solution et la capacité d’exécution sur un marché précis.'
    },
    {
      id: 2,
      question: 'Quelle différence entre vision et mission ? ',
      options: [
        'Aucune différence',
        'La vision décrit l’ambition long terme, la mission décrit ce que vous faites au quotidien',
        'La mission est financière, la vision est sociale',
        'La vision concerne uniquement les investisseurs'
      ],
      correct_answer: 1,
      explanation: 'La vision donne l’impact à long terme souhaité, la mission décrit comment vous agissez chaque jour pour l’atteindre.'
    },
    {
      id: 3,
      question: 'Pourquoi valider un “problème client” avant de parler produit ? ',
      options: [
        'Pour lancer plus vite',
        'Pour prouver qu’il existe une douleur réelle à résoudre et éviter une solution sans marché',
        'Pour impressionner les investisseurs',
        'Ce n’est pas nécessaire si l’équipe est expérimentée'
      ],
      correct_answer: 1,
      explanation: 'Sans validation du problème (interviews, données, traction), il est difficile de démontrer qu’un client paiera réellement.'
    },
    {
      id: 4,
      question: 'Que doit contenir la section “Traction & preuves” ? ',
      options: [
        'Uniquement des projections',
        'Des retours clients, essais pilotes, chiffres d’utilisation ou revenus existants',
        'La description de l’équipe',
        'Les besoins financiers détaillés'
      ],
      correct_answer: 1,
      explanation: 'Les investisseurs attendent des signaux d’adoption : clients actifs, revenus, partenariats signés, pilotes réussis.'
    },
    {
      id: 5,
      question: 'Comment présenter vos besoins financiers ? ',
      options: [
        'Avec un montant arrondi sans justification',
        'En détaillant l’enveloppe, les postes d’utilisation des fonds et l’horizon visé',
        'En citant les concurrents',
        'En listant toutes les dépenses passées'
      ],
      correct_answer: 1,
      explanation: 'Il faut montrer un plan d’utilisation clair (ex: produit, commercial, capital de travail) lié à des jalons précis.'
    }
  ],
  guided_questions: [
    {
      id: 1,
      section: 'Vision & mission',
      question: 'Quelle est votre ambition long terme et comment votre mission s’exprime au quotidien ? ',
      placeholder: 'Vision : devenir la principale plateforme… Mission : connecter les producteurs...',
      help_text: 'Expliquez la destination (vision) et la manière d’y parvenir (mission).',
      example: 'Vision : “Rendre les services financiers inclusifs en Afrique francophone.” Mission : “Nous digitalisons les tontines pour sécuriser l’épargne de 50 000 ménages dans 3 ans.”',
      common_mistake: 'Confondre vision et slogan marketing, ou rester trop vague.'
    },
    {
      id: 2,
      section: 'Problème client',
      question: 'Quel problème concret résolvez-vous et pour qui ? ',
      placeholder: 'Décrivez la douleur client, les données terrain, la taille…',
      help_text: 'Démontrez que vous connaissez votre cible et sa douleur prioritaire.',
      example: '“70 % des PME agro n’obtiennent pas de crédit car elles n’ont pas de dossier structuré – nous structurons ces données en 48h.”',
      common_mistake: 'Parler immédiatement de la solution, sans quantifier le problème.'
    },
    {
      id: 3,
      section: 'Solution & proposition de valeur',
      question: 'Quelle solution proposez-vous et pourquoi est-elle différenciante ? ',
      placeholder: 'Produit, service, innovation, éléments différenciants…',
      help_text: 'Expliquez le “comment” et ce qui vous distingue des alternatives.',
      example: '“Plateforme SaaS qui score les risques des coopératives et pré-remplit les dossiers pour les banques, réduisant le délai de financement de 12 semaines à 7 jours.”',
      common_mistake: 'Lister des fonctionnalités sans prouver la valeur pour le client.'
    },
    {
      id: 4,
      section: 'Marché & clients',
      question: 'Quel marché adressez-vous et quelle est votre cible prioritaire ? ',
      placeholder: 'Taille, segments prioritaires, dynamique…',
      help_text: 'Démontrez la taille du marché, la croissance et votre segment accessible.',
      example: '“TAM 5 Md$ (agro transformation Afrique de l’Ouest). Nous ciblons 12 000 coopératives structurées (SAM 180 M$) et adressons 600 coopératives pilotes (SOM 9 M$).”',
      common_mistake: 'Trop diluer la cible en voulant toucher “tout le monde”.'
    },
    {
      id: 5,
      section: 'Concurrence & différenciation',
      question: 'Qui sont vos principaux concurrents et quels sont vos avantages clés ? ',
      placeholder: 'Alternatives directes, indirectes, avantages concurrentiels…',
      help_text: 'Cartographiez 2-3 acteurs et démontrez pourquoi vous gagnez.',
      example: '“Banques traditionnelles : délais >12 semaines. Cabinets locaux : coût élevé. Notre différenciation : scoring propriétaire + agents terrain + dossiers prêts en 72h.”',
      common_mistake: 'Dire “nous n’avons pas de concurrence” ou rester trop générique.'
    },
    {
      id: 6,
      section: 'Traction & preuves',
      question: 'Quelles preuves d’adoption et résultats tangibles pouvez-vous partager ? ',
      placeholder: 'Clients actifs, revenus, partenariats, pilotes…',
      help_text: 'Mettez en avant les chiffres et signaux concrets.',
      example: '“12 coopératives payantes, volume financé 220 k€, NPS 42, 3 banques partenaires.”',
      common_mistake: 'Se contenter d’intentions ou déclarations qualitatives.'
    },
    {
      id: 7,
      section: 'Modèle de revenus & go-to-market',
      question: 'Comment générez-vous des revenus et comment allez-vous scaler ? ',
      placeholder: 'Sources de revenus, tarifs, plan de déploiement…',
      help_text: 'Montrez la logique économique et la stratégie d’expansion.',
      example: '“Commission 4% sur financements + abonnement premium 49€/mois. Go-to-market : 3 régions pilotes, puis extension via ministères partenaires.”',
      common_mistake: 'Rester flou sur la monétisation ou les canaux de distribution.'
    },
    {
      id: 8,
      section: 'Équipe & gouvernance',
      question: 'Qui porte le projet et quelles compétences clés sont couvertes ? ',
      placeholder: 'Fondateurs, leadership, advisory board…',
      help_text: 'Rassurez sur la capacité d’exécution et l’équilibre des compétences.',
      example: '“CEO 10 ans microfinance, CTO ex-SaaS scoring, COO ex-FAO (logistique terrain). Advisory board : ex-IFC, ex-Orange Bank.”',
      common_mistake: 'Lister des CV sans montrer la complémentarité ou les manques assumés.'
    },
    {
      id: 9,
      section: 'Besoins financiers & utilisation des fonds',
      question: 'Combien cherchez-vous et comment l’enveloppe sera utilisée ? ',
      placeholder: 'Montant, allocation par postes, jalons…',
      help_text: 'Faites le lien entre l’utilisation des fonds et les objectifs business à 12-18 mois.',
      example: '“Levée 500 k€. 45% produit, 30% commercial, 15% capital de travail, 10% conformité. Jalons : 60 coopératives, ARR 400 k€, break-even 2026.”',
      common_mistake: 'Demander un montant sans allocation détaillée ni jalons mesurables.'
    }
  ]
}

const MODULE_CONTENT_REGISTRY: Record<string, ModuleContent> = {
  step1_business_model: businessModelCanvasContent,
  step1_activity_report: activityReportContent
}

export const getModuleContent = (moduleCode: string): ModuleContent | null => {
  return MODULE_CONTENT_REGISTRY[moduleCode] ?? null
}
