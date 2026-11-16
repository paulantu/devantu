import {
  Briefcase,
  Cloud,
  Code,
  Database,
  Globe,
  Layers,
  MonitorSmartphone,
  Palette,
  PenTool,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Wrench,
  Zap,
} from "lucide-react";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  code: Code,
  palette: Palette,
  monitor: MonitorSmartphone,
  mobile: Smartphone,
  cart: ShoppingCart,
  server: Server,
  search: Search,
  rocket: Rocket,
  layers: Layers,
  pen: PenTool,
  globe: Globe,
  wrench: Wrench,
  zap: Zap,
  shield: ShieldCheck,
  database: Database,
  cloud: Cloud,
  briefcase: Briefcase,
};

export function ServiceIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = icons[name] ?? Briefcase;
  return <Icon className={className} />;
}