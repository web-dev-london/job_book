import { Book } from "@prisma/client";
export default async function chooseBook(books: Book[]) {
  const book = books[Math.floor(Math.random() * books.length)]
  return book
}