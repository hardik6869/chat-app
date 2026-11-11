import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '@/test';
import { Avatar } from '@/shared/ui';

describe('Avatar', () => {
  it('shows initials of the first and last name when there is no photo', () => {
    render(<Avatar name="Ava Mae Patel" />);

    expect(screen.getByRole('img', { name: 'Ava Mae Patel' })).toHaveTextContent('AP');
  });

  it('handles single names and blank names', () => {
    render(
      <>
        <Avatar name="design" />
        <Avatar name="  " />
      </>,
    );

    expect(screen.getByRole('img', { name: 'design' })).toHaveTextContent('D');
    expect(screen.getAllByRole('img')[1]).toHaveTextContent('?');
  });

  it('shows the photo and falls back to initials if it fails to load', () => {
    const { container } = render(<Avatar name="Liam Chen" src="/liam.jpg" />);
    const image = container.querySelector('img');
    if (!image) throw new Error('Expected the avatar photo to render');
    expect(image).toHaveAttribute('src', '/liam.jpg');

    fireEvent.error(image);

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByRole('img', { name: 'Liam Chen' })).toHaveTextContent('LC');
  });

  it('announces online status', () => {
    render(<Avatar name="Liam Chen" online />);

    expect(screen.getByRole('img', { name: 'Liam Chen, online' })).toBeInTheDocument();
  });

  it('uses the same tint for the same name', () => {
    render(
      <>
        <Avatar name="Noah" />
        <Avatar name="Noah" />
      </>,
    );
    const [first, second] = screen.getAllByText('N');

    expect(first?.className).toBe(second?.className);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Avatar name="Ava Patel" size="sm" online />
        <Avatar name="Liam Chen" src="/liam.jpg" size="xl" />
      </div>,
    );

    await expectNoA11yViolations(container);
  });
});
