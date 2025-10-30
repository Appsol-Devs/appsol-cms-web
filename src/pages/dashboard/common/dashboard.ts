import type { IDashboardSummaryCardProps } from "../component/DashboardSummaryCard";

export const dashboardSummaryInfo: IDashboardSummaryCardProps[] = [
  { title: "Total Revenue", value: 12426 },
  { title: "Outstanding Debts", value: 238478 },
  { title: "Total Tickets", value: 260, isCurrency: false },
  { title: "Total Customers", value: 550, isCurrency: false },
];

export interface IDashboardOutshandingProps {
  invoiceId: string;
  dueDate: string;
  name: string;
  amount: number;
}

export const dashboardOutstanding: IDashboardOutshandingProps[] = [
  {
    invoiceId: "INV-0001",
    dueDate: "2023-09-15",
    name: "John Doe",
    amount: 5000,
  },
  {
    invoiceId: "INV-0002",
    dueDate: "2023-09-20",
    name: "Jane Smith",
    amount: 8000,
  },
  {
    invoiceId: "INV-0003",
    dueDate: "2023-09-25",
    name: "Alice Johnson",
    amount: 12000,
  },
  {
    invoiceId: "INV-0004",
    dueDate: "2023-09-30",
    name: "Bob Williams",
    amount: 6000,
  },
  {
    invoiceId: "INV-0005",
    dueDate: "2023-10-05",
    name: "Eve Brown",
    amount: 9000,
  },
];
