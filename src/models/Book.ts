export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  image: string;
  status: "available" | "borrowed";
}