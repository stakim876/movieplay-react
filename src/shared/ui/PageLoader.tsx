import "@/styles/common/loader.css";

export default function PageLoader({ label = "로딩 중..." }: { label?: string }) {
  return (
    <div className="page-loader page-loader--fullscreen">
      <div className="page-loader-content">
        <img
          src="/assets/movieplay-logo.svg"
          alt="MoviePlay"
          className="page-loader-logo"
          width={72}
          height={72}
        />
        <div className="page-loader-spinner" />
        <p className="page-loader-text">{label}</p>
      </div>
    </div>
  );
}
