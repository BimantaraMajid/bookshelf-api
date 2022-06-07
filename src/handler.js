const { nanoid } = require('nanoid');
const books = require('./books');

/**
  * arg is object
  * {
  *   h: h,
  *   status: "success",
  *   message: "Lorem Ipsum",
  *   data: {},
  *   status_code : 200
  * }
*/
const responseServer = (arg) => {
  const response = arg.h.response({
    status: arg.status,
    message: arg.message,
    data: arg.data,
  });
  response.code(arg.status_code);
  return response;
};

const addBookHandler = (request, h) => {
  console.log(request.payload);

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const finished = readPage === pageCount;
  const id = nanoid(12);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  const arg = {
    h,
    status: 'success',
    status_code: 201,
    message: 'Buku berhasil ditambahkan',
  };

  if (!name) {
    arg.status_code = 400;
    arg.status = 'fail';
    arg.message = 'Gagal menambahkan buku. Mohon isi nama buku';
    return responseServer(arg);
  }

  if (readPage > pageCount) {
    arg.status_code = 400;
    arg.status = 'fail';
    arg.message = 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount';
    return responseServer(arg);
  }

  books.push(newBook);
  const isSuccess = books.filter((book) => book.id === id).length > 0;
  console.log(books);

  if (isSuccess) {
    arg.data = {
      bookId: id,
    };
    return responseServer(arg);
  }

  arg.status = 'error';
  arg.status_code = 500;
  arg.message = 'Buku gagal ditambahkan';
  return responseServer(arg);
};

const getBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  let allBooks = books;
  if (name) {
    allBooks = allBooks.filter((book) => `${book.name}`.toLocaleLowerCase().includes(name.toLocaleLowerCase()));
  }
  if (reading) {
    allBooks = allBooks.filter((book) => book.reading === Boolean(parseInt(reading, 10)));
  }
  if (finished) {
    allBooks = allBooks.filter((book) => book.finished === Boolean(parseInt(finished, 10)));
  }
  // if (finished) {

  // }

  allBooks = allBooks.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));
  const arg = {
    h,
    status: 'success',
    status_code: 200,
    data: {
      books: allBooks,
    },
  };

  return responseServer(arg);
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.filter((b) => b.id === bookId)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const arg = {
    h,
    status: 'fail',
    status_code: 404,
    message: 'Buku tidak ditemukan',
  };

  return responseServer(arg);
};

const updateBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const finished = readPage === pageCount;
  const updatedAt = new Date().toISOString();
  const index = books.findIndex((book) => book.id === bookId);
  const arg = {
    h,
    status: 'success',
    status_code: 200,
    message: 'Buku berhasil diperbarui',
  };

  if (!name) {
    arg.status_code = 400;
    arg.status = 'fail';
    arg.message = 'Gagal memperbarui buku. Mohon isi nama buku';
    return responseServer(arg);
  }

  if (readPage > pageCount) {
    arg.status_code = 400;
    arg.status = 'fail';
    arg.message = 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount';
    return responseServer(arg);
  }

  if (index > -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      finished,
      updatedAt,
    };

    return responseServer(arg);
  }

  arg.status_code = 404;
  arg.status = 'fail';
  arg.message = 'Gagal memperbarui buku. Id tidak ditemukan';

  return responseServer(arg);
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((book) => book.id === bookId);
  const arg = {
    h,
    status: 'success',
    status_code: 200,
    message: 'Buku berhasil dihapus',
  };

  if (index > -1) {
    books.splice(index, 1);
    return responseServer(arg);
  }

  arg.status_code = 404;
  arg.status = 'fail';
  arg.message = 'Buku gagal dihapus. Id tidak ditemukan';
  return responseServer(arg);
};

module.exports = {
  addBookHandler,
  getBooksHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
};
