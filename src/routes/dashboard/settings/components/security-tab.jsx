import React, { useState } from "react";
import { Lock, ShieldCheck, Save, Loader2 } from "lucide-react";
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match");
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
                    <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Ensure your account is secure by using a strong password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input.Password
                        label="Current Password"
                        icon={Lock}
                        placeholder="••••••••"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input.Password
                            label="New Password"
                            icon={ShieldCheck}
                            placeholder="••••••••"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            required
                        />

                        <Input.Password
                            label="Confirm New Password"
                            icon={ShieldCheck}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
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
