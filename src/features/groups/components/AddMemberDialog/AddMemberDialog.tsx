import { useId } from 'react';
import { useForm } from 'react-hook-form';
import type { User } from '@/entities';
import { cn } from '@/shared/lib';
import { Button, Modal } from '@/shared/ui';

interface AddMemberDialogProps {
  open: boolean;
  candidates: readonly User[];
  onClose: () => void;
  /** Resolves true when the member was added. */
  onAdd: (userId: string) => Promise<boolean>;
}

/** React Hook Form dialog with an accessible native select of people not yet in the group. */
export function AddMemberDialog({ open, candidates, onClose, onAdd }: AddMemberDialogProps) {
  const formId = useId();
  const selectId = useId();
  const errorId = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<{ userId: string }>({ defaultValues: { userId: '' } });

  const close = () => {
    reset();
    onClose();
  };

  const submit = handleSubmit(async ({ userId }) => {
    if (await onAdd(userId)) close();
  });

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add member"
      description="Choose someone to add to this group."
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            loading={isSubmitting}
            disabled={candidates.length === 0}
          >
            Add
          </Button>
        </>
      }
    >
      {candidates.length === 0 ? (
        <p className="text-sm text-text-muted">Everyone is already in this group.</p>
      ) : (
        <form
          id={formId}
          onSubmit={(event) => {
            void submit(event);
          }}
          className="space-y-1.5"
        >
          <label htmlFor={selectId} className="text-sm font-medium text-text">
            Person
          </label>
          <select
            id={selectId}
            aria-invalid={errors.userId ? true : undefined}
            aria-describedby={errors.userId ? errorId : undefined}
            className={cn(
              'h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-base text-text',
              errors.userId && 'border-danger',
            )}
            {...register('userId', { required: 'Choose a person to add' })}
          >
            <option value="">Select a person…</option>
            {candidates.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          {errors.userId && (
            <p id={errorId} role="alert" className="text-sm text-danger">
              {errors.userId.message}
            </p>
          )}
        </form>
      )}
    </Modal>
  );
}
