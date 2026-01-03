import SocialMenu from "../social/SocialMenu";
import NotificationMenu from "../social/NotificationMenu";

export default function TopBar() {
  return (
    <div className="fixed top-6 right-6 md:top-8 md:right-8 z-[100] flex items-center gap-3">
      <SocialMenu />
      <NotificationMenu />
    </div>
  );
}
