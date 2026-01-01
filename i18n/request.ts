import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  // 1. On récupère la locale envoyée par le middleware (ex: 'en' ou 'fr')
  let locale = await requestLocale;
 
  // 2. Vérification de sécurité : si la locale est inconnue, on force 'fr'
  if (!locale || !['fr', 'en'].includes(locale)) {
    locale = 'fr';
  }
 
  // 3. On charge le bon fichier JSON
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});