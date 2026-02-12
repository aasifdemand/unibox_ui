import React from "react";
import { Calendar, Send, Clock, Check } from "lucide-react";
import DatePicker from "../ui/date-picker";

const Step4Schedule = ({
  register,
  errors,
  watch,
  setValue,
  watchScheduleType,
}) => {
  const watchScheduledAt = watch("scheduledAt");

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100/50">
        <div className="flex items-center mb-4">
          <Calendar className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Schedule Delivery
          </h3>
        </div>
        <p className="text-gray-600">
          Choose when and how to send your campaign
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          When do you want to send?
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setValue("scheduleType", "now")}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              watchScheduleType === "now"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-green-100 to-emerald-100 flex items-center justify-center mr-4">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Send Immediately
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Start sending right away
                </p>
              </div>
              {watchScheduleType === "now" && (
                <Check className="w-6 h-6 text-green-600 ml-auto" />
              )}
            </div>
          </div>

          <div
            onClick={() => setValue("scheduleType", "later")}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
              watchScheduleType === "later"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-amber-100 to-amber-100 flex items-center justify-center mr-4">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Schedule for Later
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Choose a specific date and time
                </p>
              </div>
              {watchScheduleType === "later" && (
                <Check className="w-6 h-6 text-green-600 ml-auto" />
              )}
            </div>
          </div>
        </div>
      </div>

      {watchScheduleType === "later" && (
        <DatePicker
          label="Schedule Date & Time"
          value={watchScheduledAt}
          onChange={(value) => setValue("scheduledAt", value)}
          error={errors.scheduledAt?.message}
          required
          minDate={new Date()}
          showTime={true}
          helperText="Select when you want the campaign to start sending"
        />
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Timezone
        </label>
        <select
          {...register("timezone")}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
        >
          {Intl.supportedValuesOf("timeZone").map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500">
          All scheduled times will be based on this timezone
        </p>
      </div>
    </div>
  );
};

export default Step4Schedule;
