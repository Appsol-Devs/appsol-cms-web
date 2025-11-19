import type { ReactNode } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import clsx from "clsx";

interface ICardComponent {
  headerTitle?: ReactNode;
  headerDescription?: ReactNode;
  children?: ReactNode;
  className?: string;
  footer?: ReactNode;
}

const CardComponent = ({
  className,
  children,
  headerDescription,
  headerTitle,
  footer,
}: ICardComponent) => {
  return (
    <Card className={clsx("w-full rounded-md shadow-sm gap-1!", className)}>
      <CardHeader className="">
        <CardTitle>{headerTitle}</CardTitle>
        <CardDescription>{headerDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
      <CardFooter>{footer}</CardFooter>
    </Card>
  );
};

export default CardComponent;
