import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2 className="text-2xl font-bold mb-4">404 - Страница не найдена</h2>
      <p className="text-muted-foreground mb-4">
        К сожалению, запрошенная страница не существует.
      </p>
      <Link
        href="/"
        className="text-primary hover:underline"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}

