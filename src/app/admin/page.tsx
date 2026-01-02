'use client';

import * as React from 'react';
import Link from 'next/link';
import { Users, Wand2, Layout, DollarSign, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/admin/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminStats {
  overview: {
    totalUsers: number;
    totalGenerations: number;
    totalTemplates: number;
    activeSubscriptions: number;
    revenue: number;
  };
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
  }>;
  popularTemplates: Array<{
    id: string;
    name: string;
    type: string;
    usageCount: number;
  }>;
  modelUsage: Array<{
    model: string;
    count: number;
  }>;
  subscriptionBreakdown: Array<{
    plan: string;
    count: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-muted-foreground">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">❌</div>
          <p className="text-muted-foreground">Ошибка загрузки данных</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Админ-панель</h1>
        <p className="text-muted-foreground">
          Обзор платформы и управление ресурсами
        </p>
      </div>

      {/* Основная статистика */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Всего пользователей"
          value={stats.overview.totalUsers}
          description="зарегистрировано"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Генераций"
          value={stats.overview.totalGenerations}
          description="создано изображений"
          icon={<Wand2 className="h-4 w-4" />}
        />
        <StatCard
          title="Шаблонов"
          value={stats.overview.totalTemplates}
          description="в библиотеке"
          icon={<Layout className="h-4 w-4" />}
        />
        <StatCard
          title="Доход"
          value={`₽${stats.overview.revenue.toLocaleString()}`}
          description="за текущий месяц"
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Последние пользователи */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Последние пользователи</CardTitle>
                <CardDescription>Недавно зарегистрированные</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/users">Все пользователи</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{user.name || 'Без имени'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Популярные шаблоны */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Популярные шаблоны</CardTitle>
                <CardDescription>Топ-5 по использованию</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/templates">Все шаблоны</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.popularTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <p className="text-sm text-muted-foreground">{template.type}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    {template.usageCount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Использование AI моделей */}
        <Card>
          <CardHeader>
            <CardTitle>Использование AI моделей</CardTitle>
            <CardDescription>Распределение по моделям</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.modelUsage.map((model) => {
                const total = stats.modelUsage.reduce((sum, m) => sum + m.count, 0);
                const percentage = ((model.count / total) * 100).toFixed(1);
                
                return (
                  <div key={model.model}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="font-medium">{model.model}</span>
                      <span className="text-muted-foreground">
                        {model.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Подписки */}
        <Card>
          <CardHeader>
            <CardTitle>Подписки</CardTitle>
            <CardDescription>Распределение по тарифам</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.subscriptionBreakdown.map((sub) => {
                const total = stats.subscriptionBreakdown.reduce((sum, s) => sum + s.count, 0);
                const percentage = ((sub.count / total) * 100).toFixed(1);
                
                return (
                  <div key={sub.plan}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span className="font-medium">{sub.plan}</span>
                      <span className="text-muted-foreground">
                        {sub.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-green-600"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

