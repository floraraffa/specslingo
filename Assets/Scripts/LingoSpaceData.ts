/** Pure vocabulary data and types. No scene access or UI decisions. */
export type CategoryId = "HOME" | "FOOD" | "WORK" | "TRAVEL" | "PEOPLE" | "OUTSIDE"

export const SUPPORTED_LANGUAGES = ["Spanish", "English", "German", "French", "Italian", "Japanese"] as const
export type LanguageId = (typeof SUPPORTED_LANGUAGES)[number]
export type LearningMode = "IMAGE" | "SCAN"
export type CardSource = "REFERENCE" | "SCAN"

export type VocabularyCard = {
  id: string
  imageKey: string
  word: string
  translation: string
  contexts: CategoryId[]
  source: CardSource
}

export type NormalizedBounds = {
  x: number
  y: number
  width: number
  height: number
}

export type ScanObjectCard = {
  objectName: string
  visualDescription: string
  word: string
  translation: string
  contexts: CategoryId[]
  bounds: NormalizedBounds
}

export type SituationPhrase = {
  objectIndex: number
  intent: string
  target: string
  translation: string
  pronunciationHint: string
  usageTip: string
}

export type ScanSituation = {
  situation: string
  situationTranslation: string
  summary: string
  objects: ScanObjectCard[]
  phrases: SituationPhrase[]
}

type Concept = {
  id: string
  imageKey: string
  contexts: CategoryId[]
  words: Record<LanguageId, string>
}

const CONCEPTS: Concept[] = [
  {
    id: "cup",
    imageKey: "cup",
    contexts: ["HOME", "FOOD"],
    words: {Spanish: "la taza", English: "cup", German: "die Tasse", French: "la tasse", Italian: "la tazza", Japanese: "カップ"},
  },
  {
    id: "bed",
    imageKey: "bed",
    contexts: ["HOME"],
    words: {Spanish: "la cama", English: "bed", German: "das Bett", French: "le lit", Italian: "il letto", Japanese: "ベッド"},
  },
  {
    id: "train",
    imageKey: "train",
    contexts: ["TRAVEL"],
    words: {Spanish: "el tren", English: "train", German: "der Zug", French: "le train", Italian: "il treno", Japanese: "電車"},
  },
  {
    id: "coworker",
    imageKey: "coworker",
    contexts: ["WORK", "PEOPLE"],
    words: {Spanish: "el colega", English: "coworker", German: "der Kollege", French: "le collègue", Italian: "il collega", Japanese: "同僚"},
  },
  {
    id: "apple",
    imageKey: "apple",
    contexts: ["FOOD"],
    words: {Spanish: "la manzana", English: "apple", German: "der Apfel", French: "la pomme", Italian: "la mela", Japanese: "りんご"},
  },
  {
    id: "tree",
    imageKey: "tree",
    contexts: ["OUTSIDE"],
    words: {Spanish: "el árbol", English: "tree", German: "der Baum", French: "l’arbre", Italian: "l’albero", Japanese: "木"},
  },
  {
    id: "chair",
    imageKey: "chair",
    contexts: ["HOME", "WORK"],
    words: {Spanish: "la silla", English: "chair", German: "der Stuhl", French: "la chaise", Italian: "la sedia", Japanese: "いす"},
  },
  {
    id: "lamp",
    imageKey: "lamp",
    contexts: ["HOME", "WORK"],
    words: {Spanish: "la lámpara", English: "lamp", German: "die Lampe", French: "la lampe", Italian: "la lampada", Japanese: "ランプ"},
  },
  {
    id: "bread",
    imageKey: "bread",
    contexts: ["FOOD", "HOME"],
    words: {Spanish: "el pan", English: "bread", German: "das Brot", French: "le pain", Italian: "il pane", Japanese: "パン"},
  },
  {
    id: "banana",
    imageKey: "banana",
    contexts: ["FOOD"],
    words: {Spanish: "la banana", English: "banana", German: "die Banane", French: "la banane", Italian: "la banana", Japanese: "バナナ"},
  },
  {
    id: "bicycle",
    imageKey: "bicycle",
    contexts: ["TRAVEL", "OUTSIDE"],
    words: {Spanish: "la bicicleta", English: "bicycle", German: "das Fahrrad", French: "le vélo", Italian: "la bicicletta", Japanese: "自転車"},
  },
  {
    id: "suitcase",
    imageKey: "suitcase",
    contexts: ["TRAVEL"],
    words: {Spanish: "la maleta", English: "suitcase", German: "der Koffer", French: "la valise", Italian: "la valigia", Japanese: "スーツケース"},
  },
  {
    id: "laptop",
    imageKey: "laptop",
    contexts: ["WORK", "HOME"],
    words: {Spanish: "la laptop", English: "laptop", German: "der Laptop", French: "l’ordinateur portable", Italian: "il portatile", Japanese: "ノートパソコン"},
  },
  {
    id: "book",
    imageKey: "book",
    contexts: ["WORK", "HOME"],
    words: {Spanish: "el libro", English: "book", German: "das Buch", French: "le livre", Italian: "il libro", Japanese: "本"},
  },
  {
    id: "flower",
    imageKey: "flower",
    contexts: ["OUTSIDE", "HOME"],
    words: {Spanish: "la flor", English: "flower", German: "die Blume", French: "la fleur", Italian: "il fiore", Japanese: "花"},
  },
  {
    id: "dog",
    imageKey: "dog",
    contexts: ["HOME", "OUTSIDE"],
    words: {Spanish: "el perro", English: "dog", German: "der Hund", French: "le chien", Italian: "il cane", Japanese: "犬"},
  },
  {
    id: "teacher",
    imageKey: "teacher",
    contexts: ["WORK", "PEOPLE"],
    words: {Spanish: "la profesora", English: "teacher", German: "die Lehrerin", French: "la professeure", Italian: "l’insegnante", Japanese: "先生"},
  },
  {
    id: "doctor",
    imageKey: "doctor",
    contexts: ["WORK", "PEOPLE"],
    words: {Spanish: "el médico", English: "doctor", German: "der Arzt", French: "le médecin", Italian: "il medico", Japanese: "医者"},
  },
]

const REFERENCE_BATCH_SIZE = 6

export function isLanguageId(value: string): value is LanguageId {
  return (SUPPORTED_LANGUAGES as readonly string[]).indexOf(value) >= 0
}

export function getReferenceCards(targetLanguage: LanguageId, nativeLanguage: LanguageId, batchIndex: number = 0): VocabularyCard[] {
  const batchCount = Math.ceil(CONCEPTS.length / REFERENCE_BATCH_SIZE)
  const normalizedBatch = ((batchIndex % batchCount) + batchCount) % batchCount
  const start = normalizedBatch * REFERENCE_BATCH_SIZE
  return CONCEPTS.slice(start, start + REFERENCE_BATCH_SIZE).map((concept) => ({
    id: concept.id,
    imageKey: concept.imageKey,
    word: concept.words[targetLanguage],
    translation: concept.words[nativeLanguage],
    contexts: concept.contexts.slice(),
    source: "REFERENCE",
  }))
}

export function getReferenceBatchCount(): number {
  return Math.ceil(CONCEPTS.length / REFERENCE_BATCH_SIZE)
}

export const CATEGORY_IDS: CategoryId[] = ["HOME", "FOOD", "WORK", "TRAVEL", "PEOPLE", "OUTSIDE"]
