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

  const gotoPage = (page: number | null) => {
    if (!page) return;
    onPaginationChange?.({
      ...pagination,
      page_number: page,
    });
  };

  const renderPageLinks = () => {
    const links = [];
    for (let i = 1; i <= total_pages; i++) {
      links.push(
        <PaginationItem className="" key={i}>
          <PaginationLink
            onClick={() => gotoPage(i)}
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
            onClick={() => has_prev_page && gotoPage(prev_page!)}
            className={
              !has_prev_page
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
            aria-disabled={!has_prev_page}
          />
        </PaginationItem>

        {/* Page numbers */}
        {renderPageLinks()}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            onClick={() => has_next_page && gotoPage(next_page!)}
            className={
              !has_next_page
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
            aria-disabled={!has_next_page}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
