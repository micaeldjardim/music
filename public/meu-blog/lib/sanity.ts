// lib/sanity.ts
import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: '2vnlh9ne', // substitua pelo seu projectId do Sanity
  dataset: 'production', // ou o dataset que você estiver usando
  useCdn: true,          // true para usar o cache do CDN em produção
});
