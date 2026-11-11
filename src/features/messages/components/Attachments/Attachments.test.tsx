import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_ATTACHMENT_BYTES, type Attachment } from '@/entities';
import { Toaster } from '@/shared/ui';
import { useChatStore } from '@/store';
import { expectNoA11yViolations } from '@/test';
import { Composer } from '../Composer';
import { MessageAttachments } from './MessageAttachments';

const CONVERSATION = 'c-sofia';
const photo = new File(['png'], 'beach.png', { type: 'image/png' });
const report = new File(['pdf'], 'report.pdf', { type: 'application/pdf' });

describe('Attachments', () => {
  const sendMessage = vi.fn(() => Promise.resolve());
  const revoke = vi.fn();
  let counter = 0;

  beforeAll(async () => {
    await useChatStore.getState().bootstrap();
    await useChatStore.getState().loadMessages(CONVERSATION);
  });

  beforeEach(() => {
    sendMessage.mockClear();
    revoke.mockClear();
    useChatStore.setState({ sendMessage, drafts: {}, composerTargets: {} });
    URL.createObjectURL = vi.fn(() => `blob:file-${String((counter += 1))}`);
    URL.revokeObjectURL = revoke;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const fileInput = (container: HTMLElement) => {
    const input = container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) throw new Error('No file input');
    return input;
  };

  it('previews picked files, removes one, and sends the rest without text', async () => {
    const { container } = render(<Composer conversationId={CONVERSATION} />);

    await userEvent.upload(fileInput(container), [photo, report]);
    const previews = within(screen.getByRole('list', { name: 'Attachments' }));
    expect(previews.getByText('beach.png')).toBeInTheDocument();
    expect(previews.getByText('report.pdf')).toBeInTheDocument();

    await userEvent.click(previews.getByRole('button', { name: 'Remove report.pdf' }));
    expect(revoke).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(sendMessage).toHaveBeenCalledWith(CONVERSATION, '', undefined, [
      expect.objectContaining({ name: 'beach.png', type: 'image/png' }),
    ]);
    expect(screen.queryByRole('list', { name: 'Attachments' })).toBeNull();
    expect(revoke).toHaveBeenCalledTimes(1); // sent previews stay alive for the message
  });

  it('rejects files over the size limit', async () => {
    const { container } = render(
      <>
        <Composer conversationId={CONVERSATION} />
        <Toaster />
      </>,
    );
    const huge = new File(['x'], 'huge.mov', { type: 'video/quicktime' });
    Object.defineProperty(huge, 'size', { value: MAX_ATTACHMENT_BYTES + 1 });

    await userEvent.upload(fileInput(container), huge);

    expect(await screen.findByText('huge.mov is larger than 10 MB')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Attachments' })).toBeNull();
  });

  it('shows images and downloadable files in a bubble, with a fallback for broken images', async () => {
    const attachments: Attachment[] = [
      { id: 'a', name: 'beach.png', type: 'image/png', size: 2048, url: 'blob:a' },
      { id: 'b', name: 'report.pdf', type: 'application/pdf', size: 2_400_000, url: 'blob:b' },
    ];
    const { container } = render(<MessageAttachments attachments={attachments} isOwn={false} />);

    expect(screen.getByRole('img', { name: 'beach.png' })).toBeInTheDocument();
    const file = screen.getByRole('link', { name: /report\.pdf/ });
    expect(file).toHaveAttribute('download', 'report.pdf');
    expect(file).toHaveTextContent('2.3 MB');
    await expectNoA11yViolations(container);

    fireEvent.error(screen.getByRole('img', { name: 'beach.png' }));
    expect(screen.getByRole('link', { name: /beach\.png/ })).toBeInTheDocument();
  });
});
