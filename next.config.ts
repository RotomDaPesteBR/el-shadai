import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {

    images: {
        remotePatterns: [new URL('https://res.cloudinary.com/**/image/upload/**/**')],
    }
};

export default withNextIntl(nextConfig);
