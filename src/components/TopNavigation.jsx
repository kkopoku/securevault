

const isIndex = window.location.pathname == "/"

export default function TopNavigation() {
  return (
    <div className="relative top-0 flex flex-row w-full py-1 justify-center text-black font-bold text-lg">
        <img src="/favicon.png" className={`w-14 ${isIndex && `animate-bounce`}`} alt="SecureVault"/>
    </div>
  );
}
