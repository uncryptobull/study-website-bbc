import { topics } from './content';
export const pageNames = {
  dashboard: 'Start',
  learn: 'Lektionen',
  trainer: 'IP-Trainer',
  quiz: 'Übungen',
  exam: 'Prüfungstraining',
  mistakes: 'Fehler wiederholen',
  simulations: 'Abläufe',
  progress: 'Fortschritt',
  sources: 'Nachschlagen',
} as const;
export type Page = keyof typeof pageNames;
export type Route = { page: Page; topic?: string; step?: number };
const knownTopic = (id: string) => topics.some((t) => t.id === id);
export function parseRoute(hash: string): Route {
  const [page, topic, rawStep] = hash.replace(/^#\/?/, '').split('/');
  if (!Object.prototype.hasOwnProperty.call(pageNames, page)) return { page: 'dashboard' };
  const route: Route = { page: page as Page };
  if ((page === 'learn' || page === 'quiz') && topic && knownTopic(topic)) route.topic = topic;
  if (page === 'learn' && route.topic && rawStep && /^\d+$/.test(rawStep))
    route.step = Math.max(0, Math.min(99, Number(rawStep) - 1));
  return route;
}
export function routeHash(route: Route): string {
  if (route.page === 'learn' && route.topic)
    return `#learn/${route.topic}/${(route.step ?? 0) + 1}`;
  if (route.page === 'quiz' && route.topic) return `#quiz/${route.topic}`;
  return `#${route.page}`;
}
