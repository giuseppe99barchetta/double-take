<template>
  <div class="editor-shell">
    <div ref="editorHost" class="editor-host" />
  </div>
</template>

<script setup lang="ts">
import { EditorState, RangeSetBuilder, StateEffect, StateField } from '@codemirror/state';
import { foldKeymap, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { yaml } from '@codemirror/lang-yaml';
import { oneDark } from '@codemirror/theme-one-dark';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { tags } from '@lezer/highlight';
import { basicSetup } from 'codemirror';
import { Decoration, EditorView, drawSelection, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from '@codemirror/view';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
  changedLines?: number[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const editorHost = ref<HTMLDivElement | null>(null);
let editorView: EditorView | null = null;

const setChangedLinesEffect = StateEffect.define<Set<number>>();
const changedLineDecoration = Decoration.line({
  attributes: { class: 'cm-changed-line' },
});

const buildChangedLineDecorations = (state: EditorState, changedLines: Set<number>) => {
  const builder = new RangeSetBuilder<Decoration>();

  changedLines.forEach((lineNumber) => {
    if (lineNumber < 1 || lineNumber > state.doc.lines) {
      return;
    }

    const line = state.doc.line(lineNumber);
    builder.add(line.from, line.from, changedLineDecoration);
  });

  return builder.finish();
};

const changedLinesField = StateField.define({
  create: () => Decoration.none,
  update: (decorations, transaction) => {
    for (const effect of transaction.effects) {
      if (effect.is(setChangedLinesEffect)) {
        return buildChangedLineDecorations(transaction.state, effect.value);
      }
    }

    if (transaction.docChanged) {
      return decorations.map(transaction.changes);
    }

    return decorations;
  },
  provide: (field) => EditorView.decorations.from(field),
});

const yamlHighlightStyle = HighlightStyle.define([
  { tag: tags.comment, color: 'rgba(217, 226, 242, 0.48)', fontStyle: 'italic' },
  { tag: tags.propertyName, color: '#f4f7fb', fontWeight: '600' },
  { tag: [tags.string, tags.special(tags.string)], color: '#a5f3fc' },
  { tag: [tags.number, tags.bool, tags.null], color: '#f6c177' },
  { tag: [tags.punctuation, tags.separator], color: 'rgba(217, 226, 242, 0.52)' },
]);

const syncChangedLines = (changedLines: number[] = []) => {
  if (!editorView) {
    return;
  }

  editorView.dispatch({
    effects: setChangedLinesEffect.of(new Set(changedLines)),
  });
};

const createEditor = () => {
  if (!editorHost.value) return;

  editorView = new EditorView({
    parent: editorHost.value,
    state: EditorState.create({
      doc: props.modelValue,
      extensions: [
        basicSetup,
        history(),
        drawSelection(),
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        yaml(),
        oneDark,
        syntaxHighlighting(yamlHighlightStyle),
        changedLinesField,
        keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap, indentWithTab]),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            emit('update:modelValue', update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            height: '100%',
            minHeight: '30rem',
            backgroundColor: 'transparent',
            fontSize: '14px',
            lineHeight: '1.7',
            fontFamily: '"JetBrains Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", monospace',
          },
          '.cm-scroller': {
            overflow: 'auto',
            scrollBehavior: 'smooth',
            padding: '1.25rem 0',
          },
          '.cm-content': {
            padding: '0 1rem',
            caretColor: '#a5f3fc',
          },
          '.cm-focused': {
            outline: 'none',
          },
          '.cm-line': {
            padding: '0 0.5rem',
          },
          '.cm-gutters': {
            minWidth: '3rem',
            backgroundColor: 'rgba(8, 16, 28, 0.72)',
            color: 'rgba(217, 226, 242, 0.34)',
            borderRight: '1px solid rgba(255,255,255,0.08)',
          },
          '.cm-gutterElement': {
            padding: '0 0.75rem 0 1rem',
          },
          '.cm-activeLineGutter': {
            backgroundColor: 'rgba(125,211,252,0.10)',
            color: '#d9e2f2',
          },
          '.cm-activeLine': {
            backgroundColor: 'rgba(255,255,255,0.04)',
          },
          '.cm-changed-line': {
            backgroundColor: 'rgba(125, 211, 252, 0.08)',
            boxShadow: 'inset 2px 0 0 rgba(125, 211, 252, 0.5)',
          },
          '.cm-selectionBackground, ::selection': {
            backgroundColor: 'rgba(125,211,252,0.22) !important',
          },
          '.cm-cursor': {
            borderLeftColor: '#a5f3fc',
          },
          '.cm-foldPlaceholder': {
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#d9e2f2',
          },
          '.cm-foldGutter .cm-gutterElement': {
            padding: '0 4px',
          },
          '.cm-tooltip': {
            backgroundColor: '#0d1626',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        }),
      ],
    }),
  });

  syncChangedLines(props.changedLines);
};

watch(
  () => props.modelValue,
  (value) => {
    if (!editorView) return;

    const current = editorView.state.doc.toString();
    if (current === value) return;

    editorView.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  },
);

watch(
  () => props.changedLines,
  (value) => {
    syncChangedLines(value);
  },
  { deep: true },
);

onMounted(() => {
  createEditor();
});

onBeforeUnmount(() => {
  editorView?.destroy();
  editorView = null;
});
</script>

<style scoped>
.editor-shell {
  min-height: 30rem;
  height: min(70vh, 52rem);
}

.editor-host {
  height: 100%;
  overflow: hidden;
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.01)),
    linear-gradient(180deg, rgba(13, 22, 38, 0.96), rgba(8, 16, 28, 0.99));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 24px 64px -48px rgba(8, 16, 28, 0.9);
}

.editor-host :deep(.cm-scroller) {
  scrollbar-width: thin;
  scrollbar-color: rgba(217, 226, 242, 0.18) transparent;
}

.editor-host :deep(.cm-scroller::-webkit-scrollbar) {
  width: 10px;
  height: 10px;
}

.editor-host :deep(.cm-scroller::-webkit-scrollbar-track) {
  background: transparent;
}

.editor-host :deep(.cm-scroller::-webkit-scrollbar-thumb) {
  border: 3px solid transparent;
  border-radius: 999px;
  background: rgba(217, 226, 242, 0.16);
  background-clip: padding-box;
}

.editor-host :deep(.cm-scroller::-webkit-scrollbar-thumb:hover) {
  background: rgba(217, 226, 242, 0.24);
  background-clip: padding-box;
}

@media (max-width: 768px) {
  .editor-shell {
    height: 58vh;
    min-height: 24rem;
  }
}
</style>