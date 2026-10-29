import { act, waitFor } from '@testing-library/react';
import { Editor, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { render, screen } from '@mantine-tests/core';
import { RichTextEditor } from '../RichTextEditor';

function TestEditor({
  immediatelyRender,
  onEditor,
}: {
  immediatelyRender: boolean;
  onEditor?: (editor: Editor | null) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello world</p>',
    immediatelyRender,
  });

  onEditor?.(editor);

  return (
    <RichTextEditor editor={editor}>
      <RichTextEditor.Toolbar>
        <RichTextEditor.Bold />
        <RichTextEditor.Undo />
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
}

describe('@mantine/tiptap/RichTextEditorControl', () => {
  it('enables controls on init without focusing the editor (immediatelyRender: false)', async () => {
    render(<TestEditor immediatelyRender={false} />);

    const control = await screen.findByLabelText('Bold');
    await waitFor(() => expect(control).not.toBeDisabled());
  });

  it('enables controls on init without focusing the editor (immediatelyRender: true)', async () => {
    render(<TestEditor immediatelyRender />);

    const control = await screen.findByLabelText('Bold');
    await waitFor(() => expect(control).not.toBeDisabled());
  });

  it('reactively reflects the editor active state', async () => {
    let editor: Editor | null = null;
    render(<TestEditor immediatelyRender onEditor={(e) => (editor = e)} />);

    const control = await screen.findByLabelText('Bold');
    await waitFor(() => expect(editor).not.toBeNull());
    expect(control).not.toHaveAttribute('data-active');

    act(() => {
      editor!.chain().selectAll().toggleBold().run();
    });

    await waitFor(() => expect(control).toHaveAttribute('data-active', 'true'));
  });

  it('sets aria-pressed on toggle controls in both states', async () => {
    let editor: Editor | null = null;
    render(<TestEditor immediatelyRender onEditor={(e) => (editor = e)} />);

    const control = await screen.findByLabelText('Bold');
    await waitFor(() => expect(editor).not.toBeNull());
    expect(control).toHaveAttribute('aria-pressed', 'false');

    act(() => {
      editor!.chain().selectAll().toggleBold().run();
    });

    await waitFor(() => expect(control).toHaveAttribute('aria-pressed', 'true'));
  });

  it('does not set aria-pressed on controls without active state', async () => {
    render(<TestEditor immediatelyRender />);
    expect(await screen.findByLabelText('Undo')).not.toHaveAttribute('aria-pressed');
  });

  it('does not set aria-pressed on non-interactive controls', () => {
    const { container } = render(
      <RichTextEditor editor={null}>
        <RichTextEditor.Control interactive={false} active data-testid="label-control" />
      </RichTextEditor>
    );
    expect(container.querySelector('[data-testid="label-control"]')).not.toHaveAttribute(
      'aria-pressed'
    );
  });

  it('allows overriding aria-pressed', () => {
    const { container } = render(
      <RichTextEditor editor={null}>
        <RichTextEditor.Control active={false} aria-pressed="mixed" data-testid="custom" />
      </RichTextEditor>
    );
    expect(container.querySelector('[data-testid="custom"]')).toHaveAttribute(
      'aria-pressed',
      'mixed'
    );
  });
});
