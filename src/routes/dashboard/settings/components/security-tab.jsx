import React, { useState } from "react";
import {
  Lock,
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Input from "../../../../components/ui/input";
import Button from "../../../../components/ui/button";
import { useChangePassword } from "../../../../hooks/useAuth";
import toast from "react-hot-toast";

const SecurityTab = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const changePassword = useChangePassword();

  // Password strength validation
  const passwordChecks = {
    minLength: formData.newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.newPassword),
    hasLowerCase: /[a-z]/.test(formData.newPassword),
    hasNumber: /[0-9]/.test(formData.newPassword),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
  };

  const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
  const strengthPercentage = (passwordStrength / 5) * 100;

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordStrength < 3) {
      toast.error("Please choose a stronger password");
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password changed successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.message || "Failed to change password");
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900">
            Security Settings
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Ensure your account is secure by using a strong password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <Input.Password
            label="Current Password"
            icon={Lock}
            placeholder="••••••••"
            value={formData.currentPassword}
            onChange={(e) =>
              setFormData({ ...formData, currentPassword: e.target.value })
            }
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* New Password */}
            <div>
              <Input.Password
                label="New Password"
                icon={ShieldCheck}
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                required
              />

              {/* Password Strength Indicator */}
              {formData.newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      Password Strength: {getStrengthText()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {passwordStrength}/5
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStrengthColor()} transition-all duration-300`}
                      style={{ width: `${strengthPercentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="flex items-center gap-1.5">
                      {passwordChecks.minLength ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-gray-300" />
                      )}
                      <span className="text-xs text-gray-600">
                        Min 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordChecks.hasUpperCase ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-gray-300" />
                      )}
                      <span className="text-xs text-gray-600">Uppercase</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordChecks.hasLowerCase ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-gray-300" />
                      )}
                      <span className="text-xs text-gray-600">Lowercase</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordChecks.hasNumber ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-gray-300" />
                      )}
                      <span className="text-xs text-gray-600">Number</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      {passwordChecks.hasSpecialChar ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-gray-300" />
                      )}
                      <span className="text-xs text-gray-600">
                        Special character (!@#$%^&*)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <Input.Password
                label="Confirm New Password"
                icon={ShieldCheck}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center gap-1.5">
                  {formData.newPassword === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs text-green-600">
                        Passwords match
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-xs text-red-600">
                        Passwords do not match
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={changePassword.isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {changePassword.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecurityTab;
