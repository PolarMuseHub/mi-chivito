/**
 * Mi Chivito — Motor de Arquetipos Financieros
 * Archivo: src/utils/archetypeEngine.ts
 * Versión: 1.0
 */

export type ArchetypeId =
  | 'guardadito'
  | 'asalariado'
  | 'chambero'
  | 'endeudado'
  | 'social'
  | 'lanzado';

export interface OnboardingAnswers {
  q1: 'diario' | 'semanal' | 'quincenal' | 'esporadico';
  q2: 'efectivo' | 'banco' | 'confianza' | 'cartera';
  q3: 'guarda' | 'come' | 'deuda' | 'gusta';
  q4: 'antojitos' | 'transporte' | 'datos' | 'familia';
  q5: 'tiene' | 'consigue' | 'empenia' | 'nada';
}

export interface Archetype {
  id: ArchetypeId;
  name: string;
  headline: string;
  message: string;
  color: string;
  imageKey: string; // key para mapear a la imagen de la galería
}

export const ARCHETYPES: Record<ArchetypeId, Archetype> = {
  guardadito: {
    id: 'guardadito',
    name: 'El Guardadito',
    headline: 'Ahorras primero, piensas después.',
    message:
      'Eres de los que guardan primero y preguntan después. Eso es chido — a tu Chivito le gusta trabajar con alguien que ya sabe lo que vale un guardadito.',
    color: '#718c69',
    imageKey: 'chivito_guardadito',
  },
  asalariado: {
    id: 'asalariado',
    name: 'El Asalariado',
    headline: 'Llevas las cuentas claras.',
    message:
      'Quincenal, bancarizado, con deudas bajo control. Tu Chivito ya sabe cuándo llega la raya — ahora solo hay que hacer que alcance para más.',
    color: '#4a7a5f',
    imageKey: 'chivito_asalariado',
  },
  chambero: {
    id: 'chambero',
    name: 'El Chambero',
    headline: 'El dinero te entra y te sale rápido.',
    message:
      'Trabajas duro y te la sabes. El problema no es lo que ganas — es que cuando entra mucho también sale mucho. Ahí es donde yo entro.',
    color: '#f4a258',
    imageKey: 'chivito_chambero',
  },
  endeudado: {
    id: 'endeudado',
    name: 'El Luchón',
    headline: 'Siempre encuentras cómo salir adelante.',
    message:
      'Lo bueno: sabes lo que debes y quieres pagarlo. Lo mejor: con un plan claro, siempre encuentras la forma de salir adelante.',
    color: '#c45c2a',
    imageKey: 'chivito_endeudado',
  },
  social: {
    id: 'social',
    name: 'El Social',
    headline: 'Tu red es tu banco.',
    message:
      'Las tandas, los préstamos entre familia, el compadre que ayuda — así funciona tu economía. Mi trabajo es que ese sistema te funcione mejor.',
    color: '#bdd4ce',
    imageKey: 'chivito_social',
  },
  lanzado: {
    id: 'lanzado',
    name: 'El Lanzado',
    headline: 'Vives el momento.',
    message:
      "Para eso trabajas, ¿no? Solo hay que asegurarte de que el próximo viernes también haya pa' los gastos. Ahí es donde yo puedo ayudar.",
    color: '#9abfb5',
    imageKey: 'chivito_lanzado',
  },
};

type ScoreMap = Record<ArchetypeId, number>;

const Q1_MAP: Record<string, Partial<ScoreMap>> = {
  diario:     { chambero: 2 },
  semanal:    { chambero: 1, asalariado: 1 },
  quincenal:  { asalariado: 2 },
  esporadico: { chambero: 2, lanzado: 1 },
};

const Q2_MAP: Record<string, Partial<ScoreMap>> = {
  efectivo:  { guardadito: 2, chambero: 1 },
  banco:     { asalariado: 2 },
  confianza: { social: 3 },
  cartera:   { lanzado: 2, endeudado: 1 },
};

const Q3_MAP: Record<string, Partial<ScoreMap>> = {
  guarda: { guardadito: 3 },
  come:   { lanzado: 2, chambero: 1 },
  deuda:  { endeudado: 3 },
  gusta:  { lanzado: 3 },
};

const Q4_MAP: Record<string, Partial<ScoreMap>> = {
  antojitos:  { lanzado: 1, chambero: 1 },
  transporte: { asalariado: 1, chambero: 1 },
  datos:      { lanzado: 1 },
  familia:    { social: 3 },
};

const Q5_MAP: Record<string, Partial<ScoreMap>> = {
  tiene:    { guardadito: 3 },
  consigue: { social: 2 },
  empenia:  { endeudado: 3 },
  nada:     { lanzado: 2, endeudado: 1 },
};

export interface ArchetypeResult {
  archetype: Archetype;
  scores: ScoreMap;
}

export function calculateArchetype(answers: OnboardingAnswers): ArchetypeResult {
  const scores: ScoreMap = {
    guardadito: 0,
    asalariado: 0,
    chambero:   0,
    endeudado:  0,
    social:     0,
    lanzado:    0,
  };

  const maps = [
    Q1_MAP[answers.q1],
    Q2_MAP[answers.q2],
    Q3_MAP[answers.q3],
    Q4_MAP[answers.q4],
    Q5_MAP[answers.q5],
  ];

  maps.forEach((pts) => {
    if (!pts) return;
    (Object.entries(pts) as [ArchetypeId, number][]).forEach(([id, val]) => {
      scores[id] += val;
    });
  });

  const winnerId = (Object.entries(scores) as [ArchetypeId, number][]).reduce(
    (best, curr) => (curr[1] > best[1] ? curr : best),
    ['guardadito' as ArchetypeId, -1] as [ArchetypeId, number]
  )[0];

  return { archetype: ARCHETYPES[winnerId], scores };
}
