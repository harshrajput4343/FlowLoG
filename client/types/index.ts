export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Label {
  id: number;
  name: string;
  color: string;
  boardId: number;
}

export interface Card {
  id: number;
  title: string;
  description?: string;
  order: number;
  listId: number;
  dueDate?: string; // ISO string
  labels: Label[];
  members: User[];
  checklists: Checklist[];
  coverUrl?: string;
}

export interface Checklist {
  id: number;
  title: string;
  items: ChecklistItem[];
}

export interface ChecklistItem {
  id: number;
  content: string;
  isChecked: boolean;
}

export interface List {
  id: number;
  title: string;
  order: number;
  boardId: number;
  cards: Card[];
}

export interface Board {
  id: number;
  title: string;
  background: string;
  lists: List[];
  members: User[];
  labels?: Label[];
}
