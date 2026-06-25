import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { IMetaData } from "@/lib/pagination";

export function PaginationComponent({
  pagination,
  onPaginationChange,
}: {
  pagination: IMetaData;
  onPaginationChange?: React.Dispatch<React.SetStateAction<IMetaData>>;
}) {
  const {
    total_pages = 1,
    page_number = 1,
    has_next_page,
    has_prev_page,
    next_page,
    prev_page,
  } = pagination;

  const currentPage = page_number ?? 1;
  const pages = total_pages ?? 1;
  const canGoPrev = has_prev_page ?? currentPage > 1;
  const canGoNext = has_next_page ?? currentPage < pages;
  const targetPrevPage = prev_page ?? (canGoPrev ? currentPage - 1 : null);
  const targetNextPage = next_page ?? (canGoNext ? currentPage + 1 : null);

  const gotoPage = (page: number | null) => {
    if (!page || page < 1 || page > pages) return;
    onPaginationChange?.({
      ...pagination,
      page_number: page,
      has_next_page: page < pages,
      has_prev_page: page > 1,
      next_page: page < pages ? page + 1 : null,
      prev_page: page > 1 ? page - 1 : null,
    });
  };

  const renderPageLinks = () => {
    const links = [];
    for (let i = 1; i <= total_pages; i++) {
      links.push(
        <PaginationItem className="" key={i}>
          <PaginationLink
            href="#"
            onClick={(event) => {
              event.preventDefault();
              gotoPage(i);
            }}
            isActive={i === page_number}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return links;
  };

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            onClick={(event) => {
              event.preventDefault();
              if (canGoPrev) gotoPage(targetPrevPage);
            }}
            className={
              !canGoPrev
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : "cursor-pointer"
            }
            aria-disabled={!canGoPrev}
          />
        </PaginationItem>

        {/* Page numbers */}
        {renderPageLinks()}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            onClick={(event) => {
              event.preventDefault();
              if (canGoNext) gotoPage(targetNextPage);
            }}
            className={
              !canGoNext
                ? "opacity-50 cursor-not-allowed pointer-events-none"
                : "cursor-pointer"
            }
            aria-disabled={!canGoNext}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
