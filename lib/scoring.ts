export type LeadBrief = {
  district: string;
  budget_usd?: number | null;
  bedrooms?: string | null;
  timeline?: string | null;
};

export type Recommendation = {
  project_code: string;
  project_name: string;
  score: number; // 0-100
  reasons: string[];
};

/**
 * Borrador: scoring simple y determinístico.
 * En V1, esto se reemplaza por tu pipeline housing + modelo explicable.
 */
export function generateRecommendations(brief: LeadBrief): Recommendation[] {
  const base: Recommendation[] = [
    {
      project_code: 'CYG-JM-URB',
      project_name: 'Urbanzen',
      score: 82,
      reasons: [
        `Match distrito: ${brief.district}`,
        'Buen balance precio/beneficios (placeholder)',
        'Liquidez estimada alta (placeholder)',
      ],
    },
    {
      project_code: 'CYG-JM-MAT',
      project_name: 'Matera',
      score: 78,
      reasons: ['Tipologías similares disponibles (placeholder)', 'Plusvalía esperada (placeholder)'],
    },
    {
      project_code: 'CYG-JM-FEN',
      project_name: 'Fenix',
      score: 74,
      reasons: ['Opciones por presupuesto (placeholder)', 'Conectividad (placeholder)'],
    },
  ];

  // Ajuste pequeño por presupuesto
  if (brief.budget_usd && brief.budget_usd < 100000) {
    base[2].score += 4;
    base[2].reasons.push('Presupuesto: mejor encaje relativo');
  }

  return base
    .map((r) => ({ ...r, score: Math.max(0, Math.min(100, r.score)) }))
    .sort((a, b) => b.score - a.score);
}
