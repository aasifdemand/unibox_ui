import React from "react";
import { Settings, Eye, BarChart, Target } from "lucide-react";

const Step5Settings = ({
  register,
  errors,
  watch,
  setValue,
  selectedBatch,
}) => {
  const watchThrottlePerMinute = watch("throttlePerMinute");
  const watchName = watch("name");
  const watchScheduleType = watch("scheduleType");
  const watchScheduledAt = watch("scheduledAt");

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100/50">
        <div className="flex items-center mb-4">
          <Settings className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Campaign Settings
          </h3>
        </div>
        <p className="text-gray-600">
          Configure tracking and delivery preferences
        </p>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Sending Speed
        </label>
        <div className="p-6 rounded-xl border border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium text-gray-900">Emails per minute</p>
              <p className="text-sm text-gray-600">
                Control how fast emails are sent
              </p>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {watchThrottlePerMinute}
            </div>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={watchThrottlePerMinute}
            onChange={(e) =>
              setValue("throttlePerMinute", parseInt(e.target.value))
            }
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Slow (1/min)</span>
            <span>Fast (100/min)</span>
          </div>
        </div>
        {errors.throttlePerMinute && (
          <p className="text-sm text-red-600">
            {errors.throttlePerMinute.message}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Tracking & Privacy
        </label>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center mr-3">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Track Opens</p>
                <p className="text-sm text-gray-600">
                  Monitor who opens your emails
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              {...register("trackOpens")}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-green-100 to-emerald-100 flex items-center justify-center mr-3">
                <BarChart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Track Clicks</p>
                <p className="text-sm text-gray-600">
                  Monitor link clicks in emails
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              {...register("trackClicks")}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-linear-to-br from-purple-100 to-purple-100 flex items-center justify-center mr-3">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Unsubscribe Link</p>
                <p className="text-sm text-gray-600">
                  Include opt-out link in emails
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              {...register("unsubscribeLink")}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50/30">
        <h4 className="font-semibold text-gray-900 mb-4">Campaign Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Campaign Name</span>
            <span className="font-medium">{watchName || "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Recipients</span>
            <span className="font-medium">
              {selectedBatch
                ? `${selectedBatch.validRecords} contacts`
                : "Not selected"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sending Speed</span>
            <span className="font-medium">
              {watchThrottlePerMinute} emails/min
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Scheduled</span>
            <span className="font-medium">
              {watchScheduleType === "now"
                ? "Immediately"
                : watchScheduledAt
                  ? "Scheduled"
                  : "Not set"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Settings;
