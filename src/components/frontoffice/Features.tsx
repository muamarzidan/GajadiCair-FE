import { Card, CardContent } from "@/components/ui/card";
import { Scan, Users, Coins, Clock, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "Smart Biometric Attendance",
    description: "Facial, expression, and hand movement validation to prevent fraud. Equipped with geolocation for work area control.",
  },
  {
    icon: Users,
    title: "Employee Management",
    description: "Full CRUD for employee data with a self-service portal to access personal information and attendance history.",
  },
  {
    icon: Coins,
    title: "Automated Payroll",
    description: "Monthly cronjob calculates salaries, allowances, deductions, and overtime automatically. Digital payslips available for employees.",
  },
  {
    icon: Clock,
    title: "Validated Overtime",
    description: "Overtime system with 3-level biometric image validation. Overtime hours are automatically calculated and integrated with payroll.",
  },
  {
    icon: Shield,
    title: "High-Level Security",
    description: "Multi-level access with data encryption. Admins and employees have separate portals based on access rights.",
  },
  {
    icon: Zap,
    title: "Real-time Notifications",
    description: "Automatic email notifications for admins when payroll is completed or deductions occur. Employees receive payslip alerts.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Complete Features for HR Management
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage employees and payroll in one integrated platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="gradient-card border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1 animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="inline-flex p-3 rounded-lg bg-blue-500/10 mb-4">
                    <Icon className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
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
