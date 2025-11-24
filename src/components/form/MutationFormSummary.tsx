import CardComponent from "@/components/CardComponent";
import { Loader, Save } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  submitData: () => void;
  isLoading?: boolean;
  summaryData: ISummarySection[];
  summaryMainTitle: string;
  summarySaveButtonText?: string;
}

interface ISummary {
  label: string;
  value?: string | number | null;
  required?: boolean;
}

export interface ISummarySection {
  title: string;
  icon: ReactNode;
  data: ISummary[];
}

const MutationFormSummary = ({
  summaryData,
  summaryMainTitle,
  submitData,
  isLoading,
  summarySaveButtonText,
}: Props) => {
  const required = (
    <span className="text-xs">
      <span className="text-red-500">(*)</span>
    </span>
  );

  return (
    <div className="md:w-1/3 space-y-2">
      <CardComponent
        className=" h-max"
        headerTitle={
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="flex items-center gap-2"> {summaryMainTitle}</p>
            </div>
            <Separator orientation="horizontal" />
          </>
        }
      >
        <div className="space-y-8">
          {summaryData?.map((section, index) => (
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
                  <span className="font-semibold text-right text-sm w-[80%]">
                    {item.value}
                  </span>
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
        {isLoading ? "Saving..." : summarySaveButtonText || "Save"}
      </Button>
    </div>
  );
};

export default MutationFormSummary;
