import type { CategoryId, Expense, PaymentMethod, PersonId } from '../domain/types';
import { toISODate } from '../lib/date';
import { uid } from '../lib/id';

type Template = [desc: string, place: string, min: number, max: number];

const TEMPLATES: Partial<Record<CategoryId, Template[]>> = {
  comida: [
    ['Jantar', 'Coco Bambu', 140, 280],
    ['Almoço', 'Sabor da Vila', 45, 95],
    ['iFood', 'Delivery', 40, 115],
    ['Pizza', 'Bráz Pizzaria', 95, 170],
    ['Café da manhã', 'Padaria Real', 25, 60],
    ['Hambúrguer', 'Madero', 80, 150],
    ['Sushi', 'Temakeria', 90, 190],
  ],
  mercado: [
    ['Compras da semana', 'Pão de Açúcar', 190, 430],
    ['Hortifruti', 'Oba Hortifruti', 50, 130],
    ['Mercadinho', 'Carrefour Express', 30, 95],
  ],
  transporte: [
    ['Uber', 'Uber', 14, 48],
    ['99', '99', 12, 42],
    ['Gasolina', 'Posto Shell', 160, 260],
    ['Estacionamento', 'Shopping', 15, 35],
  ],
  lazer: [
    ['Cinema', 'Cinemark', 60, 110],
    ['Bar', 'Bar do Zé', 70, 190],
    ['Show', 'Ingresso.com', 160, 380],
    ['Livraria', 'Livraria Cultura', 50, 140],
  ],
  saude: [
    ['Farmácia', 'Drogasil', 30, 160],
    ['Consulta', 'Clínica Vida', 220, 350],
  ],
  presentes: [
    ['Presente de aniversário', 'Shopping', 90, 300],
    ['Flores', 'Floricultura', 60, 140],
  ],
  pets: [
    ['Ração', 'Petz', 150, 230],
    ['Banho e tosa', 'Pet Shop', 70, 110],
    ['Veterinário', 'Clínica Vet', 180, 320],
  ],
  outros: [
    ['Utilidades de casa', 'Leroy Merlin', 40, 200],
    ['Lavanderia', '5àSec', 40, 90],
  ],
  viagem: [
    ['Hotel', 'Booking', 600, 1300],
    ['Passagem', 'Gol', 400, 1000],
    ['Airbnb', 'Airbnb', 500, 1100],
  ],
};

const WEIGHTS: [CategoryId, number][] = [
  ['comida', 14],
  ['mercado', 6],
  ['transporte', 12],
  ['lazer', 3],
  ['saude', 2],
  ['pets', 2],
  ['outros', 2],
  ['presentes', 1],
];

/** Gera 6 meses de gastos de exemplo (determinístico), terminando hoje. */
export function seedData(now = new Date()): Expense[] {
  let s = 20261003;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  const pick = <T,>(a: T[]) => a[Math.floor(rand() * a.length)];
  const totalWeight = WEIGHTS.reduce((a, w) => a + w[1], 0);
  const weightedCategory = (): CategoryId => {
    let x = rand() * totalWeight;
    for (const [c, w] of WEIGHTS) if ((x -= w) < 0) return c;
    return 'outros';
  };

  const out: Expense[] = [];
  for (let m = 5; m >= 0; m--) {
    const d0 = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const y = d0.getFullYear();
    const mo = d0.getMonth();
    const dim = new Date(y, mo + 1, 0).getDate();
    const last = m === 0 ? now.getDate() : dim;

    const add = (
      day: number,
      cat: CategoryId,
      desc: string,
      place: string,
      amount: number,
      who: PersonId,
      pay: PaymentMethod,
    ) => {
      if (day > last) return;
      out.push({
        id: uid(),
        amount: Math.round(amount * 100) / 100,
        desc,
        place,
        cat,
        who,
        pay,
        status: 'pago',
        date: toISODate(y, mo, day),
      });
    };

    // Fixos
    add(5, 'moradia', 'Aluguel', 'Imobiliária', 2800, 'casal', 'Pix');
    add(10, 'moradia', 'Condomínio', 'Condomínio', 640, 'casal', 'Pix');
    add(12, 'contas', 'Luz', 'Enel', 150 + rand() * 70, 'casal', 'Débito');
    add(15, 'contas', 'Internet', 'Vivo Fibra', 119.9, 'casal', 'Débito');
    add(18, 'contas', 'Água', 'Sabesp', 70 + rand() * 40, 'casal', 'Débito');
    add(8, 'lazer', 'Streaming', 'Netflix', 55.9, 'enddy', 'Crédito');

    // Variáveis
    const n = Math.max(3, Math.round(((36 + rand() * 12) * last) / dim));
    for (let i = 0; i < n; i++) {
      const cat = weightedCategory();
      const [desc, place, lo, hi] = pick(TEMPLATES[cat]!);
      const who: PersonId = rand() < 0.2 ? 'casal' : rand() < 0.52 ? 'enddy' : 'bento';
      let pay = pick<PaymentMethod>(['Crédito', 'Crédito', 'Pix', 'Débito', 'Crédito', 'Dinheiro']);
      if ((cat === 'comida' || cat === 'mercado') && rand() < 0.3) pay = 'VR/VA';
      if (desc === 'Uber' || desc === '99') pay = 'Crédito';
      add(1 + Math.floor(rand() * last), cat, desc, place, lo + rand() * (hi - lo), who, pay);
    }

    // Viagens em alguns meses
    if (m === 2 || m === 4) {
      const trips = TEMPLATES.viagem!;
      const [d1, p1, l1, h1] = trips[1];
      add(20, 'viagem', d1, p1, l1 + rand() * (h1 - l1), 'bento', 'Crédito');
      const [d2, p2, l2, h2] = pick([trips[0], trips[2]]);
      add(22, 'viagem', d2, p2, l2 + rand() * (h2 - l2), 'enddy', 'Crédito');
    }
  }
  return out;
}
