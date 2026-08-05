const pageClass =
  "min-h-screen bg-[#1f1f1f] text-[#251f1f] sm:flex sm:items-center sm:justify-center sm:px-4 sm:py-8";
const screenClass =
  "relative mx-auto h-[874px] w-full max-w-[402px] overflow-hidden bg-gradient-to-b from-[#d9e9ed] to-white to-[95%] px-[25px] pt-[57px] shadow-2xl";

const roleButtons = ["농가", "교육이수자", "중개 센터"];

function RegisterDetail() {
  return (
    <main className={pageClass}>
      <section className={screenClass} aria-labelledby="register-detail-title">
        <div
          className="absolute right-[25px] top-[57px] h-[63px] w-[71px] bg-[#d9d9d9]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-0 top-[129px] h-[24px] w-[25px] bg-[#d9d9d9]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 top-[129px] h-[24px] w-[25px] bg-[#d9d9d9]"
          aria-hidden="true"
        />

        <h1
          id="register-detail-title"
          className="mt-[51px] whitespace-pre-line text-[28px] font-medium leading-[1.18] text-[#484f51]"
        >
          안녕하세요{"\n"}도시농부 플러스* 입니다.
        </h1>

        <p className="mt-[22px] w-[273px] text-[14px] leading-normal text-[#41b3e0]">
          교육이수자,농가,중개센터 중에 선택해주세요
          <br />
          <span className="font-medium text-[#269dcd]">
            교육 이수자 제외 인증이 필요합니다.
          </span>
        </p>
        <div className="mt-[2px] h-px w-[198px] bg-[#269dcd]" />

        <div className="mt-[45px] flex flex-col items-center gap-[41px]">
          {roleButtons.map((role) => (
            <button
              key={role}
              type="button"
              className="flex h-[138px] w-[138px] cursor-pointer items-center justify-center rounded-[33px] border border-[#b7e04d] bg-[#cfea89] text-[24px] font-normal text-black transition hover:bg-[#c4e675] focus:outline-none focus:ring-2 focus:ring-[#91ad43]"
            >
              {role}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

export default RegisterDetail;
