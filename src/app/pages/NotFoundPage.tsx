import { CircleHelp } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib';
import { buttonBase, buttonVariants, EmptyState } from '@/shared/ui';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={CircleHelp}
      title="Page not found"
      description="The page you're looking for doesn't exist."
      className="h-dvh"
      action={
        <Link to="/" className={cn(buttonBase, buttonVariants.primary, 'h-10 px-4 text-sm')}>
          Go to chats
        </Link>
      }
    />
  );
}
