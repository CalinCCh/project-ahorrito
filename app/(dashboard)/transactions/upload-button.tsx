import { Upload } from "lucide-react";
import { useCSVReader } from "react-papaparse";

import { Button } from "@/components/ui/button";

type Props = {
  onUpload: (results: any) => void;
};

export const UploadButton = ({ onUpload }: Props) => {
  const { CSVReader } = useCSVReader();

  //TODO: Add a paywall

  return (
    <CSVReader onUploadAccepted={onUpload}>
      {({ getRootProps }: any) => (
        <Button
          variant="outline"
          className="h-11 px-4 text-sm bg-white/80 backdrop-blur-sm border border-blue-200 rounded-lg hover:bg-blue-50/50 hover:border-blue-300 shadow-sm transition-all duration-200 cursor-pointer font-medium"
          {...getRootProps()}
        >
          <Upload className="size-4 mr-2 text-slate-600" />
          Import CSV
        </Button>
      )}
    </CSVReader>
  );
};
