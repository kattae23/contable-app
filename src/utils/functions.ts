export function getSkip (take: number, page: number): number {
  return (page - 1) * take
}

export function paginateResponse<T> (
  page: number,
  take: number,
  total: number,
  data: T
) {
  const lastPage = Math.ceil(total / take)
  const nextPage = page + 1 > lastPage ? null : page + 1
  const prevPage = page - 1 < 1 ? null : page - 1

  return {
    data,
    total,
    currentPage: page,
    nextPage,
    prevPage,
    lastPage
  }
}
