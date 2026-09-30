import type { TFunction } from 'i18next'
import type { Block, BlockType } from '@/api/types'

export type BlockGroup = 'text' | 'words' | 'exercise' | 'task'

interface BlockMeta {
  icon: string
  group: BlockGroup
}

/** i18n: hw_block_<type> */
export const BLOCK_META: Record<BlockType, BlockMeta> = {
  heading: { icon: 'title', group: 'text' },
  rich_text: { icon: 'notes', group: 'text' },
  grammar_box: { icon: 'lightbulb', group: 'text' },
  vocab_table: { icon: 'translate', group: 'words' },
  gap_fill: { icon: 'space_bar', group: 'exercise' },
  multiple_choice: { icon: 'checklist', group: 'exercise' },
  error_correction: { icon: 'spellcheck', group: 'exercise' },
  free_sentences: { icon: 'edit_note', group: 'exercise' },
  writing_task: { icon: 'mail', group: 'task' },
  reading: { icon: 'menu_book', group: 'task' },
  media: { icon: 'play_circle', group: 'task' },
  exam_part: { icon: 'workspace_premium', group: 'task' },
  free_form: { icon: 'extension', group: 'task' },
}

/** Blocks numbered as "Exercise N". Headings, rich text, word tables and grammar boxes are not. */
const EXERCISE_TYPES: ReadonlySet<BlockType> = new Set<BlockType>([
  'gap_fill',
  'multiple_choice',
  'error_correction',
  'free_sentences',
  'writing_task',
  'reading',
  'media',
  'exam_part',
  'free_form',
])

export const isExercise = (block: Block) => EXERCISE_TYPES.has(block.type)

/** Block id -> exercise number (1-based, document order). Computed on render, never stored. */
export function exerciseNumbers(blocks: Block[]): Map<string, number> {
  const numbers = new Map<string, number>()
  for (const block of blocks) if (isExercise(block)) numbers.set(block.id, numbers.size + 1)
  return numbers
}

/** The block's eyebrow label: the purpose for free sentences, else the type name. */
export function blockLabel(block: Block, t: TFunction): string {
  return block.type === 'free_sentences' && block.purpose
    ? t(`hw_purpose_${block.purpose}`)
    : t(`hw_block_${block.type}`)
}

export const GAP = '___'

/** Split a gap-fill line into text parts; a gap sits between consecutive parts. */
export function splitGaps(text: string): string[] {
  return text.split(GAP)
}
