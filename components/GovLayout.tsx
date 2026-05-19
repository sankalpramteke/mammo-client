// GovLayout → Now proxies to DishLayout for DISHA branding
// All existing authenticated pages continue to work with no changes needed.
import DishLayout from '@/components/DishLayout';

export default function GovLayout({ children }: { children: React.ReactNode }) {
  return <DishLayout>{children}</DishLayout>;
}

