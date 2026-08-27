import type { IconType } from "react-icons";
import {
  FiAlertCircle,
  FiBell,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiHome,
  FiMapPin,
  FiSettings,
  FiUser,
  FiUsers,
  FiXCircle,
  FiChevronLeft,
  FiSearch,
} from "react-icons/fi";

export type AppIconName =
  | "admin"
  | "alert"
  | "application"
  | "approved"
  | "calendar"
  | "education"
  | "location"
  | "notification"
  | "pending"
  | "rejected"
  | "user"
  | "users"
  | "home"
  | "chevron-left"
  | "search";

const icons: Record<AppIconName, IconType> = {
  admin: FiSettings,
  alert: FiAlertCircle,
  application: FiFileText,
  approved: FiCheckCircle,
  calendar: FiCalendar,
  education: FiBookOpen,
  location: FiMapPin,
  notification: FiBell,
  pending: FiClock,
  rejected: FiXCircle,
  user: FiUser,
  users: FiUsers,
  home: FiHome,
  "chevron-left": FiChevronLeft,
  search: FiSearch,
};

type AppIconProps = Omit<React.ComponentProps<IconType>, "aria-label"> & {
  name: AppIconName;
  label?: string;
};

/** API에서 이미지 URL을 받지 않아도 일관된 아이콘을 표시합니다. */
export default function AppIcon({ name, label, ...props }: AppIconProps) {
  const Icon = icons[name];

  return <Icon aria-label={label ?? name} role="img" {...props} />;
}
