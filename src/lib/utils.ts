import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Безопасное удаление DOM элемента
 * Проверяет, что элемент является дочерним перед удалением
 * Это предотвращает ошибку "The node to be removed is not a child of this node"
 */
export function safeRemoveChild(parent: Node, child: Node): void {
  try {
    if (parent.contains(child)) {
      parent.removeChild(child);
    }
  } catch (error) {
    // Игнорируем ошибки удаления - элемент уже мог быть удалён
    if (process.env.NODE_ENV === 'development') {
      console.warn('Failed to remove child element:', error);
    }
  }
}