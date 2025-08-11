import { useState, useMemo } from 'react';

const usePagination = (data, initialItemsPerPage = 6) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const paginatedData = useMemo(() => {
    // S'assurer que data est un tableau
    const safeData = Array.isArray(data) ? data : [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return safeData.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const totalPages = Math.ceil((Array.isArray(data) ? data.length : 0) / itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const changeItemsPerPage = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToPreviousPage = () => goToPage(currentPage - 1);

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    paginatedData,
    totalItems: data.length,
    goToPage,
    changeItemsPerPage,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};

export default usePagination;
