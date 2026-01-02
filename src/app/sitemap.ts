import { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();
  
  // Статические маршруты с приоритетами
  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/generate', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/generate/batch', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/edit', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/templates', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/subscription', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/profile', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: '/favorites', priority: 0.6, changeFrequency: 'daily' as const },
    { path: '/edits', priority: 0.6, changeFrequency: 'daily' as const },
    { path: '/api-docs', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: '/login', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/register', priority: 0.4, changeFrequency: 'monthly' as const },
  ];

  return staticRoutes.map(({ path, priority, changeFrequency }) => ({
    url: `${siteUrl}${path}`,
    lastModified: currentDate,
    changeFrequency,
    priority,
  }));
}

