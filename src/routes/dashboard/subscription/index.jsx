import React from "react";
import { CheckCircle2, Zap, Shield, Sparkles, CreditCard } from "lucide-react";

const Subscription = () => {
    const plans = [
        {
            name: "Starter",
            handle: "Perfect for individuals",
            price: "$29",
            billing: "per user / month",
            icon: <Zap className="w-6 h-6 text-emerald-500" />,
            features: [
                "Up to 5 connected mailboxes",
                "1,000 emails per month",
                "Basic analytics & reporting",
                "Standard templates",
                "Email support",
            ],
            buttonText: "Current Plan",
            popular: false,
            color: "emerald",
        },
        {
            name: "Professional",
            handle: "For growing teams",
            price: "$99",
            billing: "per user / month",
            icon: <Sparkles className="w-6 h-6 text-blue-500" />,
            features: [
                "Unlimited mailboxes",
                "50,000 emails per month",
                "Advanced AI analytics",
                "Premium templates & A/B testing",
                "Sequence builder",
                "Priority 24/7 support",
            ],
            buttonText: "Upgrade to Pro",
            popular: true,
            color: "blue",
        },
        {
            name: "Enterprise",
            handle: "For scaled operations",
            price: "Custom",
            billing: "tailored to your needs",
            icon: <Shield className="w-6 h-6 text-violet-500" />,
            features: [
                "Everything in Professional",
                "Unlimited sending volume",
                "Dedicated success manager",
                "Custom IP warming",
                "SSO & advanced security",
                "SLA guarantee",
            ],
            buttonText: "Contact Sales",
            popular: false,
            color: "violet",
        },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="text-center mb-16 pt-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
                        Pricing & Plans
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tighter mb-4">
                    Simple, transparent <span className="text-gradient">pricing</span>
                </h1>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">
                    Choose the perfect plan for your outreach needs. Scale your cold email game without limits.
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`relative flex flex-col premium-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${plan.popular
                                ? "bg-gradient-to-b from-white to-blue-50/30 border-blue-200/60 ring-1 ring-blue-500/20"
                                : "bg-white"
                            }`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-1 px-4 rounded-full shadow-lg border border-blue-400/30 w-max">
                                    Most Popular
                                </div>
                            </div>
                        )}

                        <div className="p-8 pb-0">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
                                {plan.icon}
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-800 mb-1">{plan.name}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                                {plan.handle}
                            </p>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-extrabold text-slate-800 tracking-tighter">
                                    {plan.price}
                                </span>
                                {plan.price !== "Custom" && (
                                    <span className="text-slate-400 text-sm font-semibold">/mo</span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-slate-500 mb-8">{plan.billing}</p>

                            <button
                                className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${plan.popular
                                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30"
                                        : plan.name === "Starter"
                                            ? "bg-slate-100 text-slate-500 cursor-default"
                                            : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                                    }`}
                            >
                                {plan.buttonText}
                            </button>
                        </div>

                        <div className="p-8 pt-8 mt-auto">
                            <div className="w-full h-px bg-slate-100 mb-8"></div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                                What's included
                            </p>
                            <ul className="space-y-4">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-3">
                                        <CheckCircle2
                                            className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? "text-blue-500" : "text-emerald-500"
                                                }`}
                                        />
                                        <span className="text-sm font-medium text-slate-600">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {/* FAQ or Footer snippet */}
            <div className="mt-20 pt-10 border-t border-slate-200/60 text-center">
                <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-800 tracking-tight mb-2">
                    Have questions about pricing?
                </h4>
                <p className="text-sm text-slate-500">
                    Our team is here to help you find the perfect setup for your organization.
                    <br />
                    Contact us at <span className="text-blue-600 font-semibold cursor-pointer hover:underline transition-all">billing@unibox.co</span>
                </p>
            </div>
        </div>
    );
};

export default Subscription;
