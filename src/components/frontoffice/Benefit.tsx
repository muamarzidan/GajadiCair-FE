import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Clock, DollarSign, Users } from "lucide-react";

const benefits = [
    {
        icon: Clock,
        stat: "80%",
        label: "Save Administrative Time",
        description: "HR automation reduces manual workload by up to 80%",
    },
    {
        icon: DollarSign,
        stat: "100%",
        label: "Payroll Accuracy",
        description: "Automated salary calculations eliminate human error",
    },
    {
        icon: Users,
        stat: "5000+",
        label: "Trusted by Companies",
        description: "Trusted by thousands of companies across various industries",
    },
    {
        icon: TrendingUp,
        stat: "50%",
        label: "Boost Productivity",
        description: "Employees can focus more on core tasks instead of administration",
    },
];


export const Benefits = () => {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 animate-fade-up">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4">
                        Why Choose <span className="text-gradient">GajadiCair</span>?
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Join thousands of companies that have experienced its benefits
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, index) => {
                        const Icon = benefit.icon;
                        return (
                            <Card
                                key={index}
                                className="text-center gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <CardContent className="p-6">
                                    <div className="inline-flex p-4 rounded-full bg-secondary/10 mb-4">
                                        <Icon className="h-8 w-8 text-blue-950" />
                                    </div>
                                    <div className="text-4xl font-bold text-gradient mb-2">{benefit.stat}</div>
                                    <h3 className="text-lg font-bold mb-2">{benefit.label}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};