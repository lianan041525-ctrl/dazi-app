import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export type NavItem = {
  key: string;
  label: string;
  href: string;
  sort_order: number;
  enabled: boolean;
};

export function useNavConfig() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.from('nav_config')
      .select('*')
      .eq('enabled', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) setNavItems(data);
      });
  }, []);

  return navItems;
}
