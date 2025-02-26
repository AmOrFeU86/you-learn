export interface Concept {
  id: number;
  father: number | null;
  children: number[];
  title: string;
  description: string;
  label: string;
  category: string;
  example: string;
}
