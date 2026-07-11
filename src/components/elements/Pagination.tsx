import PaginationClient from "./PaginationClient";

interface PaginationProps {
  classList: string;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination(props: PaginationProps) {
  return <PaginationClient {...props} />;
}
