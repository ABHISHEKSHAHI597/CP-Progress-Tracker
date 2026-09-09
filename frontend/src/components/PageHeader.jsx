function PageHeader({ title, lede, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 pb-6 border-b border-line">
      <div className="min-w-0">
        <h1 className="wide text-[30px] sm:text-[38px] font-semibold leading-none">
          {title}
        </h1>

        {lede && (
          <p className="text-mute mt-3 max-w-[62ch] text-[14px] sm:text-[15px]">
            {lede}
          </p>
        )}
      </div>

      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

export default PageHeader;
