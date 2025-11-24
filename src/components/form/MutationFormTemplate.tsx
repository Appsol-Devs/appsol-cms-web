import ActionButton from "@/components/ActionButtons";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import PageSummary from "@/components/PageSummary";
import PageTitle from "@/components/PageTitle";
import { type FC, type ReactNode, type SVGProps } from "react";
import { type UseFormReturn } from "react-hook-form";
import MutationForm from "./MutationForm";
import MutationFormSummary, {
  type ISummarySection,
} from "./MutationFormSummary";

export interface IMutationFormTemplateProps<T extends Record<string, unknown>> {
  form: UseFormReturn<T, any, T>;
  pageTitle: string;
  pageSummary: {
    title: string;
    description: string;
    icon: FC<SVGProps<SVGSVGElement>>;
  };
  submitData: () => void;
  loading?: boolean;
  formContent: ReactNode;
  mutationFormSummary: {
    summaryData: ISummarySection[];
    summaryMainTitle: string;
    summarySaveButtonText?: string;
  };
}

const MutationFormTemplate = <T extends Record<string, unknown>>({
  form,
  formContent,
  pageSummary,
  pageTitle,
  submitData,
  loading,
  mutationFormSummary,
}: IMutationFormTemplateProps<T>) => {
  return (
    <div className="space-y-2">
      <PageTitle showBack title={pageTitle} />
      <PageSummary
        icon={pageSummary.icon}
        title={pageSummary.title}
        description={pageSummary.description}
        actionComponent={
          <div className="flex items-center gap-2">
            <ActionButton
              onClick={submitData}
              type="save"
              useText={mutationFormSummary.summarySaveButtonText || "Save"}
            />
            <ConfirmationDialog
              onConfirmClicked={() => form.reset()}
              disabled={loading}
              title="Clear Form"
              content={
                <div className="text-center">
                  <p>Are you sure you want to clear this form?</p>
                  <p>If you proceed, you will remove all entered data.</p>
                </div>
              }
              rightActionTitle="Proceed"
              trigger={<ActionButton type="remove" useText="Reset Form" />}
            />
          </div>
        }
      />
      <div className="w-full flex md:flex-row flex-col gap-4">
        <MutationForm formContent={formContent} />
        <MutationFormSummary
          summaryData={mutationFormSummary.summaryData}
          summaryMainTitle={mutationFormSummary.summaryMainTitle}
          isLoading={loading}
          submitData={submitData}
          summarySaveButtonText={mutationFormSummary.summarySaveButtonText}
        />
      </div>
    </div>
  );
};

export default MutationFormTemplate;
