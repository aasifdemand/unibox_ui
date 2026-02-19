import React, { useState } from "react";
import { User, Mail, Save, Loader2 } from "lucide-react";
import Input from "../../../../components/ui/input";
import Button from "../../../../components/ui/button";
import { useUpdateProfile } from "../../../../hooks/useAuth";
import toast from "react-hot-toast";

const ProfileTab = ({ user }) => {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });

    const updateProfile = useUpdateProfile();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProfile.mutateAsync(formData);
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error.message || "Failed to update profile");
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-2xl">
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Update your personal details and how others see you on the platform.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Full Name"
                        icon={User}
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <Input
                        label="Email Address"
                        icon={Mail}
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        helperText="This email will be used for account notifications and login."
                    />

                    <div className="pt-4 border-t border-gray-100 mt-8 flex justify-end">
                        <Button
                            type="submit"
                            disabled={updateProfile.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {updateProfile.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileTab;
