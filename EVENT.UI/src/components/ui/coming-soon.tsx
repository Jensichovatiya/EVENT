import { LucideIcon, Rocket, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from './card';
import { Badge } from './badge';

interface ComingSoonPageProps {
  title: string;
  description: string;
  features: string[];
  Icon?: LucideIcon;
}

export function ComingSoonPage({ title, description, features, Icon = Rocket }: ComingSoonPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary" />
      </div>

      <Badge variant="secondary" className="mb-4 text-xs font-semibold tracking-wider uppercase">
        Coming Soon
      </Badge>

      <h1 className="text-3xl font-bold tracking-tight mb-3">{title}</h1>
      <p className="text-muted-foreground max-w-md mb-8 text-base leading-relaxed">{description}</p>

      <Card className="w-full max-w-md text-left">
        <CardContent className="pt-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Planned Features
          </p>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
