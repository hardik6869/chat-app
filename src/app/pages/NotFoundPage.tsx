import { CircleHelp } from 'lucide-react';
import { Link } from 'react-router';
import { buttonClassName, EmptyState } from '@/shared/ui';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={CircleHelp}
      title="Page not found"
      description="The page you're looking for doesn't exist."
      className="h-dvh"
      action={
        <Link to="/" className={buttonClassName()}>
          Go to chats
        </Link>
      }
    />
  );
}
