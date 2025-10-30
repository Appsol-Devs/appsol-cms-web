import {
  Pagination,
  PaginationContent,
  //   PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { IPaginationState } from "@/lib/pagination";

export function PaginationComponent(pagination: IPaginationState) {
  const { totalPages, pageIndex } = pagination;

  const renderPageLinks = () => {
    const links = [];
    for (let i = 1; i <= (totalPages || 1); i++) {
      links.push(
        <PaginationItem key={i}>
          <PaginationLink href={`#`} isActive={i === pageIndex}>
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
        <PaginationItem>
          <PaginationPrevious
            href={pageIndex === 1 ? undefined : "#"}
            className={pageIndex === 1 ? "disabled" : ""}
            aria-disabled={pageIndex === 1}
          />
        </PaginationItem>
        {renderPageLinks()}
        <PaginationItem>
          <PaginationNext
            href={pageIndex === totalPages ? undefined : "#"}
            className={pageIndex === totalPages ? "disabled" : ""}
            aria-disabled={pageIndex === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
