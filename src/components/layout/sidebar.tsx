"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import AdminPanelIcon from "@/public/icons/admin-panel-icon.svg";
import PeopleIcon from "@/public/icons/people-icon.svg";
import ReportIcon from "@/public/icons/report-icon.svg";
import FeedIcon from "@/public/icons/feed.svg";
import GroupsIcon from "@/public/icons/groups.svg";
import BusinessIcon from "@/public/icons/business.svg";
import MailIcon from "@/public/icons/mail-icon.svg";
import ClockIcon from "@/public/icons/clock-icon.svg";
import SettingsIcon from "@/public/icons/settings-icon.svg";
import StarIcon from "@/public/icons/star-icon.svg";
import EventIcon from "@/public/icons/event.svg";
import VerifiedIcon from "@/public/icons/verified-icon.svg";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  children?: NavChild[];
  /** If true, only match pathname === href exactly */
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: AdminPanelIcon,
    exact: true,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: SettingsIcon,
    children: [
      { label: "Users", href: "/analytics/users" },
      { label: "Content", href: "/analytics/content" },
      { label: "Revenue", href: "/analytics/revenue" },
    ],
  },
  { label: "Users", href: "/users", icon: PeopleIcon },
  { label: "Moderation", href: "/moderation", icon: ReportIcon },
  {
    label: "Content",
    href: "/content",
    icon: FeedIcon,
    children: [
      { label: "Posts", href: "/content/posts" },
      { label: "Comments", href: "/content/comments" },
    ],
  },
  { label: "Groups", href: "/groups", icon: GroupsIcon },
  { label: "Businesses", href: "/businesses", icon: BusinessIcon },
  {
    label: "Business Verifications",
    href: "/business-verifications",
    icon: VerifiedIcon,
  },
  { label: "Events", href: "/events", icon: EventIcon },
  {
    label: "Ads",
    href: "/ads",
    icon: StarIcon,
    children: [
      { label: "All Ads", href: "/ads/all" },
      { label: "Pricing", href: "/ads/pricing" },
    ],
  },
  // { label: "Broadcast", href: "/broadcast", icon: MailIcon },
  { label: "Audit Logs", href: "/audit", icon: ClockIcon },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Close drawer on route change (mobile nav)
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  function isParentActive(item: NavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  function isChildActive(href: string): boolean {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col w-72 h-screen bg-white border-r border-gray-100 overflow-y-auto transition-transform duration-300 md:relative md:translate-x-0 md:w-60 md:shrink-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100 shrink-0">
        <Image
          src="/images/logo.png"
          alt="Nigerian Community"
          width={32}
          height={32}
        />
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">
            NC Admin
          </p>
          <p className="text-xs text-gray-400">Dashboard</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const parentActive = isParentActive(item);

          return (
            <div key={item.href}>
              {/* Parent link */}
              <Link
                href={item.children ? item.children[0].href : item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  parentActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${parentActive ? "text-primary" : "text-gray-400"}`}
                />
                {item.label}
              </Link>

              {/* Sub-items — shown when parent route is active */}
              {item.children && parentActive && (
                <div className="ml-11 mt-0.5 space-y-0.5">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        isChildActive(child.href)
                          ? "text-primary font-semibold bg-primary/5"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 shrink-0">
        <p className="text-xs text-gray-400 text-center">
          Nigerian Community © 2025
        </p>
      </div>
    </aside>
  );
}
