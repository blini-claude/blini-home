export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center mb-4">
          {/* Spinning ring */}
          <div className="w-[56px] h-[56px] rounded-full border-[3px] border-[#F0F0F0] border-t-[#FFC334] animate-spin" />
          {/* Logo letter in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[16px] font-black text-[#062F35] italic">B</span>
          </div>
        </div>
        <p className="text-[12px] font-semibold text-[rgba(18,18,18,0.35)] tracking-wider uppercase">
          Duke ngarkuar...
        </p>
      </div>
    </div>
  );
}
