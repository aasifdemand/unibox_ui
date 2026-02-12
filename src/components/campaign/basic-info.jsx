import React from "react";
import { PenTool, Sparkles, Send } from "lucide-react";
import Input from "../ui/input";
import Textarea from "../ui/textarea";

const Step1BasicInfo = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100/50">
        <div className="flex items-center mb-4">
          <PenTool className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Campaign Basics
          </h3>
        </div>
        <p className="text-gray-600 mb-6">
          Give your campaign a name and craft an engaging subject line that will
          capture attention.
        </p>
      </div>

      <Input
        label="Campaign Name"
        placeholder="e.g., Black Friday Sale 2024"
        {...register("name")}
        error={errors.name?.message}
        required
        icon={Sparkles}
        helperText="Choose a descriptive name to identify this campaign"
      />

      <Input
        label="Email Subject"
        placeholder="e.g., Exclusive Black Friday Deals Inside!"
        {...register("subject")}
        error={errors.subject?.message}
        required
        icon={Send}
        helperText="This is what recipients will see in their inbox"
      />

      <Textarea
        label="Preview Text"
        placeholder="A sneak peek of what's inside the email..."
        {...register("previewText")}
        error={errors.previewText?.message}
        rows={2}
        helperText="Optional: Short text shown next to subject in some email clients"
      />
    </div>
  );
};

export default Step1BasicInfo;
