import { Loader2 } from "lucide-react";
import React from "react";

const Loader = ({ isLoading, mailboxes }) => {
  if (isLoading && mailboxes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading mailboxes...</p>
        </div>
      </div>
    );
  }
};

export default Loader;
