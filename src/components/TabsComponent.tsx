import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ITabs {
  tabs: { label: string; value: React.ReactNode }[];
}

export default function TabsComponent({ tabs }: ITabs) {
  return (
    <Tabs defaultValue={tabs[0]?.label || ""} className="">
      <div className="w-full overflow-x-auto">
        <TabsList className="flex w-max min-w-full flex-nowrap gap-2 px-2">
          {tabs?.map((tab) => (
            <TabsTrigger
              className="hover:border-primary hover:border-2 min-w-max px-4 bg-muted/70 text-muted-foreground"
              key={tab.label}
              value={tab.label}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      {tabs?.map((tab) => (
        <TabsContent key={tab.label} value={tab.label}>
          {tab.value}
        </TabsContent>
      ))}
    </Tabs>
  );
}
