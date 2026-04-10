import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/b/', '/join/', '/api/'],
      },
    ],
    sitemap: 'https://flowlogwork.me/sitemap.xml',
    host: 'https://flowlogwork.me',
  };
}
