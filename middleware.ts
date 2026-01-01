import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // La liste des langues supportées
  locales: ['fr', 'en'],
 
  // Langue par défaut si l'URL ne contient pas de langue
  defaultLocale: 'fr'
});
 
export const config = {
  // Matcher pour ignorer les fichiers API, images, etc.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};