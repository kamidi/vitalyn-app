import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  /* Tes futures options de config iront ici */
};

export default withNextIntl(nextConfig);