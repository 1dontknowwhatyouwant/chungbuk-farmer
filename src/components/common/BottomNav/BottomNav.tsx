import {
  homeAccountOff,
  homeAccountOn,
  homeAnnouncementOff,
  homeHomeOff,
  homeHomeOn,
} from "../../../assets/assets";

interface BottomNavProps {
  activePage?: "home" | "mypage";
  onGoHome?: () => void;
  onGoToMypage?: () => void;
  onGoToAnnouncement?: () => void;
  variant?: "home" | "mypage";
}

function BottomNav({
  activePage = "home",
  onGoHome,
  onGoToMypage,
  onGoToAnnouncement,
  variant = "home",
}: BottomNavProps) {
  const isHomeActive = activePage === "home";
  // The bottom bar is shared by every primary screen; only the active icon changes.
  const navClassName =
    "absolute bottom-[12px] left-[6.2%] box-border h-[77px] w-[87.6%] rounded-[35px] border border-[#F2F8E1] bg-[linear-gradient(180deg,rgba(248,253,234,0.44)_-25.32%,rgba(199,232,115,0.44)_100%)]";

  return (
    <nav className={navClassName} aria-label="하단 메뉴">
      <button
        type="button"
        onClick={onGoHome}
        className="absolute left-[48px] top-[12px] flex flex-col items-center border-0 bg-transparent p-0"
      >
        <img src={(isHomeActive ? homeHomeOn : homeHomeOff).src} alt="" className="h-[38px] w-[38px]" />
        <span className={`mt-[6px] text-[14px] font-normal leading-[17px] ${isHomeActive ? "text-[#4672B9]" : "text-[#97ABB1]"}`}>
          홈
        </span>
      </button>
      <button
        type="button"
        onClick={onGoToAnnouncement}
        className="absolute left-[160px] top-[12px] flex flex-col items-center border-0 bg-transparent p-0"
      >
        <img src={homeAnnouncementOff.src} alt="" className="h-[38px] w-[38px]" />
        <span className="mt-[6px] text-[14px] font-normal leading-[17px] text-[#97ABB1]">
          공고
        </span>
      </button>
      <button
        type="button"
        onClick={onGoToMypage}
        className="absolute left-[272px] top-[12px] flex flex-col items-center border-0 bg-transparent p-0"
      >
        <img src={(activePage === "mypage" ? homeAccountOn : homeAccountOff).src} alt="" className="h-[38px] w-[38px]" />
        <span className={`mt-[6px] text-[14px] font-normal leading-[17px] ${activePage === "mypage" ? "text-[#4672B9]" : "text-[#97ABB1]"}`}>
          내 정보
        </span>
      </button>
    </nav>
  );
}

export default BottomNav;
