import { Button, Modal } from '@/shared/ui';
import { useDeleteMessage } from '../../hooks';

/**
 * One confirmation dialog per open chat, driven by the store, so it survives the message
 * row scrolling out of the virtualized list.
 */
export function DeleteMessageDialog() {
  const { isOpen, confirm, cancel } = useDeleteMessage();

  return (
    <Modal
      open={isOpen}
      onClose={cancel}
      title="Delete message?"
      description="It will be removed for everyone in this chat. This can't be undone."
      footer={
        <>
          <Button variant="secondary" onClick={cancel}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              void confirm();
            }}
          >
            Delete
          </Button>
        </>
      }
    />
  );
}
