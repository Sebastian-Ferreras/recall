export interface Deck {
  id: number;
  name: string;
  description: string | null;
  cardCount: number;
  createdAt: string;
}

export interface Card {
  id: number;
  deckId: number;
  question: string;
  answer: string;
}

export interface DeckInput {
  name: string;
  description?: string | null;
}

export interface CardInput {
  question: string;
  answer: string;
}
