import CardComponent from "@/components/CardComponent";
import { BookOpenText, Loader, Save, Shield } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { IUserFields } from "./UsersForm";

interface Props {
  values: IUserFields;
  submitData: () => void;
  isLoading?: boolean;
}

interface ISummary {
  label: string;
  value?: string | number | null;
  required?: boolean;
}

interface ISummarySection {
  title: string;
  icon: ReactNode;
  data: ISummary[];
}

const UserBasicDetailsSummary = ({ values, submitData, isLoading }: Props) => {
  const required = (
    <span className="text-xs">
      <span className="text-red-500">(*)</span>
    </span>
  );

  const summarySections: ISummarySection[] = [
    {
      title: "Basic Information",
      icon: <BookOpenText className="w-4 h-4" />,
      data: [
        { label: "First Name", value: values?.firstName, required: true },
        { label: "Last Name", value: values?.lastName, required: true },
        {
          label: "Phone Number",
          value: values?.phone,
          required: true,
        },
      ],
    },
    {
      title: "Identification & Security Information",
      icon: <Shield className="w-4 h-4" />,
      data: [
        {
          label: "Role",
          value: values?.role?.label as string,
          required: true,
        },
        {
          label: "Email",
          value: values?.email as string,
          required: true,
        },
      ],
    },
  ];

  return (
    <div className="md:w-1/3 space-y-2">
      <CardComponent
        className=" h-max"
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2"> User Details Summary</p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="space-y-8">
          {summarySections.map((section, index) => (
            <div key={index} className="space-y-1 text-sm ">
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="flex items-center font-semibold gap-2">
                  {section.icon} {section.title}
                </p>
              </div>
              <Separator orientation="horizontal" />
              {section.data.map((item, idx) => (
                <p
                  key={idx}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {item.label}
                    {item.required && required}
                  </span>{" "}
                  <span className="font-semibold">{item.value}</span>
                </p>
              ))}
            </div>
          ))}
        </div>
      </CardComponent>
      <Button
        disabled={isLoading}
        onClick={submitData}
        className="rounded-full w-full bg-primary! text-primary-foreground! text-xs!"
        type="submit"
      >
        {isLoading ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}{" "}
        {isLoading ? "Saving..." : "Save Customer"}
      </Button>
    </div>
  );
};

export default UserBasicDetailsSummary;
