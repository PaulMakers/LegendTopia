import React, { useState, useRef } from 'react';
import { LangSwitch } from './LangSwitch';

interface GuideSectionProps {
  lang: 'id' | 'en';
  onLangSwitch: (lang: 'id' | 'en') => void;
  onCopyIpOnly: () => void;
}

export const GuideSection: React.FC<GuideSectionProps> = ({
  lang,
  onLangSwitch,
  onCopyIpOnly,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 4;
  const touchStartXRef = useRef<number>(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].screenX;
    const diff = touchStartXRef.current - endX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
  };

  return (
    <section id="guide" className="sandbox-card p-6 sm:p-8 mb-6">
      {/* Title & Lang Switch */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="font-pixel text-sm sm:text-base text-[#1e293b] flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-[#2563eb] shrink-0"
            viewBox="0 0 897 1024"
            fill="currentColor"
          >
            <path d="M832.338 192q27 0 45.5 18.5t18.5 45.5v640q0 49-66.5 88.5t-125.5 39.5h-576q-53 0-90.5-37.5T.338 896V128q0-53 37.5-90.5t90.5-37.5h704q26 0 45 19t19 45.5t-19 45t-45 18.5h-672q-13 0-22.5 9.5t-9.5 22.5t9.5 22.5t22.5 9.5h224v288q0 12 11 22t21 10l96-96l96 96q10 0 21-10t11-22V192h192z" />
          </svg>
          <span>{lang === 'id' ? 'CARA BERMAIN' : 'HOW TO PLAY'}</span>
        </div>

        <LangSwitch currentLang={lang} onSwitch={onLangSwitch} />
      </div>

      {/* Guide Carousel Box */}
      <div
        className="relative bg-white border-4 border-[#2563eb] rounded-lg overflow-hidden shadow-[6px_6px_0_#1e40af]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Next Slide Arrow Button */}
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 btn-slide-next"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </button>

        {/* Slider Track */}
        <div
          className="flex transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {/* Card 1: Android PowerTunnel */}
          <div className="min-w-full w-full p-5 sm:p-7 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 border-dashed">
              <div className="w-10 h-10 rounded-xl bg-[#dbeafe] border-2 border-[#2563eb] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-[#2563eb]" viewBox="0 0 24 24">
                  <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.43 11.43 0 00-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C4.8 11.16 3.5 13.84 3.5 16.5h17c0-2.66-1.3-5.34-2.9-7.02zM7 14.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#1e293b] text-base font-pixel text-xs sm:text-sm">Android</h3>
                <span className="text-xs text-[#64748b]">PowerTunnel Method</span>
              </div>
            </div>

            <ol className="space-y-2.5 text-sm text-[#334155]">
              {lang === 'id' ? (
                <>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">1</span>
                    <span>Download <a href="https://sfile.mobi/9yeA3hP6fYz" target="_blank" rel="noreferrer" className="text-[#2563eb] font-bold underline font-semibold hover:text-emerald-300">PowerTunnel</a></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">2</span>
                    <span>Install PowerTunnel ke perangkat anda</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">3</span>
                    <span>Buka aplikasi PowerTunnel.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">4</span>
                    <span>Ketuk ikon Settings di pojok kanan atas.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">5</span>
                    <span>Pilih menu Plugins.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">6</span>
                    <span>Pastikan plugin Hosts aktif (centang), lalu ketuk ikon di sebelahnya.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">7</span>
                    <span>Pada bagian Hosts file URL, masukkan: <code className="text-xs bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono break-all">https://legendtopia.vercel.app/gtps-host.txt</code></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">8</span>
                    <span>Pada opsi Hosts file update period, pilih <strong className="text-[#2563eb] font-bold">On start</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">9</span>
                    <span>Tekan tombol OK untuk menyimpan.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">10</span>
                    <span>Kembali ke menu utama lalu tekan CONNECT hingga berubah menjadi DISCONNECT. Buka Growtopia!</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">1</span>
                    <span>Download <a href="https://sfile.mobi/9yeA3hP6fYz" target="_blank" rel="noreferrer" className="text-[#2563eb] font-bold underline font-semibold hover:text-emerald-300">PowerTunnel</a></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">2</span>
                    <span>Install PowerTunnel on your device.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">3</span>
                    <span>Open the PowerTunnel application.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">4</span>
                    <span>Tap Settings in the top-right corner.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">5</span>
                    <span>Select Plugins menu.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">6</span>
                    <span>Ensure Hosts plugin is enabled (checked) and tap the gear icon next to it.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">7</span>
                    <span>In Hosts file URL field, type: <code className="text-xs bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono break-all">https://legendtopia.vercel.app/gtps-host.txt</code></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">8</span>
                    <span>Set update period to <strong className="text-[#2563eb] font-bold">On start</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">9</span>
                    <span>Press OK to save settings.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">10</span>
                    <span>Return to main screen and press CONNECT until it says DISCONNECT. Open Growtopia!</span>
                  </li>
                </>
              )}
            </ol>
            <div className="md:hidden text-center text-xs text-[#2563eb] font-bold font-semibold mt-4 pt-3 border-t border-slate-200 border-dashed animate-swipe-pulse">
              {lang === 'id' ? 'GESER KE KIRI →' : 'SWIPE LEFT →'}
            </div>
          </div>

          {/* Card 2: Android Hosts Go */}
          <div className="min-w-full w-full p-5 sm:p-7 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 border-dashed">
              <div className="w-10 h-10 rounded-xl bg-[#dbeafe] border-2 border-[#2563eb] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-[#2563eb]" viewBox="0 0 24 24">
                  <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24a11.43 11.43 0 00-8.94 0L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85l1.84 3.18C4.8 11.16 3.5 13.84 3.5 16.5h17c0-2.66-1.3-5.34-2.9-7.02zM7 14.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#1e293b] text-base font-pixel text-xs sm:text-sm">Android</h3>
                <span className="text-xs text-[#64748b]">Hosts Go Method</span>
              </div>
            </div>

            <ol className="space-y-2.5 text-sm text-[#334155]">
              {lang === 'id' ? (
                <>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">1</span>
                    <span>Download <a href="https://sfile.mobi/5YCy57j3Es5" target="_blank" rel="noreferrer" className="text-[#2563eb] font-bold underline font-semibold hover:text-emerald-300">Hosts Go</a></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">2</span>
                    <span>Install Hosts Go ke perangkat Anda.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">3</span>
                    <span>Buka Hosts Go dan pilih <strong className="text-white">Hosts Editor</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">4</span>
                    <span>Klik titik tiga ⋮ di sebelah kanan atas, pilih <strong className="text-white">Download Hosts File</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">5</span>
                    <span>Masukkan URL: <code className="text-xs bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono break-all">https://legendtopia.vercel.app/gtps.host</code></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">6</span>
                    <span>Pilih <strong className="text-[#2563eb] font-bold">Download and Apply</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">7</span>
                    <span>Kembali ke menu awal lalu klik <strong className="text-[#2563eb] font-bold">START</strong>. Buka Growtopia!</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">1</span>
                    <span>Download <a href="https://sfile.mobi/5YCy57j3Es5" target="_blank" rel="noreferrer" className="text-[#2563eb] font-bold underline font-semibold hover:text-emerald-300">Hosts Go</a></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">2</span>
                    <span>Install Hosts Go on your device.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">3</span>
                    <span>Open Hosts Go and select <strong className="text-white">Hosts Editor</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">4</span>
                    <span>Tap ⋮ menu icon on top right, then choose <strong className="text-white">Download Hosts File</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">5</span>
                    <span>Enter URL: <code className="text-xs bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono break-all">https://legendtopia.vercel.app/gtps.host</code></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">6</span>
                    <span>Select <strong className="text-[#2563eb] font-bold">Download and Apply</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">7</span>
                    <span>Go back and tap <strong className="text-[#2563eb] font-bold">START</strong>. Launch Growtopia!</span>
                  </li>
                </>
              )}
            </ol>
            <div className="md:hidden text-center text-xs text-[#2563eb] font-bold font-semibold mt-4 pt-3 border-t border-slate-200 border-dashed animate-swipe-pulse">
              {lang === 'id' ? 'GESER KE KIRI →' : 'SWIPE LEFT →'}
            </div>
          </div>

          {/* Card 3: iOS Surge 5 */}
          <div className="min-w-full w-full p-5 sm:p-7 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 border-dashed">
              <div className="w-10 h-10 rounded-xl bg-[#dbeafe] border-2 border-[#2563eb] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-[#2563eb]" viewBox="0 0 400 480">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#1e293b] text-base font-pixel text-xs sm:text-sm">iOS</h3>
                <span className="text-xs text-[#64748b]">Surge 5 Configuration</span>
              </div>
            </div>

            <ol className="space-y-2.5 text-sm text-[#334155]">
              {lang === 'id' ? (
                <>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">1</span>
                    <span>Buka App Store dan unduh Surge 5.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">2</span>
                    <span>Buka Surge 5 dan klik OKE.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">3</span>
                    <span>Klik Default.conf.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">4</span>
                    <span>Pilih IMPORT → Download Profile From URL.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">5</span>
                    <span>Input link: <code className="text-xs bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono break-all">https://legendtopia.vercel.app/api/ios</code></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">6</span>
                    <span>Tekan OK dan DONE.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">7</span>
                    <span>Klik SETUP, setujui kebijakan lalu tekan Allow VPN. Buka Growtopia!</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">1</span>
                    <span>Open the App Store and download Surge 5.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">2</span>
                    <span>Open Surge 5 and accept prompt.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">3</span>
                    <span>Tap Default.conf profile.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">4</span>
                    <span>Select IMPORT → Download Profile From URL.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">5</span>
                    <span>Enter URL: <code className="text-xs bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono break-all">https://legendtopia.vercel.app/api/ios</code></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">6</span>
                    <span>Tap OK and DONE.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">7</span>
                    <span>Tap SETUP and allow VPN Configuration profile. Open Growtopia!</span>
                  </li>
                </>
              )}
            </ol>
            <div className="md:hidden text-center text-xs text-[#2563eb] font-bold font-semibold mt-4 pt-3 border-t border-slate-200 border-dashed animate-swipe-pulse">
              {lang === 'id' ? 'GESER KE KIRI →' : 'SWIPE LEFT →'}
            </div>
          </div>

          {/* Card 4: Windows */}
          <div className="min-w-full w-full p-5 sm:p-7 flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 border-dashed">
              <div className="w-10 h-10 rounded-xl bg-[#dbeafe] border-2 border-[#2563eb] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 fill-[#2563eb]" viewBox="0 0 480 480">
                  <path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-[#1e293b] text-base font-pixel text-xs sm:text-sm">Windows PC</h3>
                <span className="text-xs text-[#64748b]">Manual Host Edit</span>
              </div>
            </div>

            <ol className="space-y-2.5 text-sm text-[#334155]">
              {lang === 'id' ? (
                <>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">1</span>
                    <span>Tekan <kbd className="px-1.5 py-0.5 text-xs bg-[#e2e8f0] text-[#1e293b] border-slate-300 border border-neutral-700 rounded">⊞ Win + R</kbd></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">2</span>
                    <span>Ketik <code className="text-xs font-mono text-emerald-300 bg-[#e2e8f0] text-[#1e293b] border-slate-300 px-1 py-0.5 rounded">C:\Windows\System32\drivers\etc</code></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">3</span>
                    <span>Temukan file bernama <strong className="text-white">hosts</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">4</span>
                    <span>Klik kanan dan buka dengan Notepad (Run as Administrator) atau Notepad++.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">5</span>
                    <div className="w-full">
                      <span>Copy dan paste baris berikut:</span>
                      <div className="mt-1.5 p-2 rounded-lg bg-[#f1f5f9] text-[#1e293b] border-2 border-[#2563eb] font-mono text-xs text-[#2563eb] font-bold border border-emerald-500/30 flex items-center justify-between">
                        <pre>15.235.227.241 www.growtopia1.com{'\n'}15.235.227.241 www.growtopia2.com</pre>
                        <button
                          onClick={onCopyIpOnly}
                          className="px-2 py-1 bg-emerald-500 text-black font-sans font-semibold rounded text-[11px] hover:bg-emerald-400 shrink-0 ml-2"
                        >
                          Salin
                        </button>
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">6</span>
                    <span>Simpan file (<kbd className="px-1.5 py-0.5 text-xs bg-[#e2e8f0] text-[#1e293b] border-slate-300 border border-neutral-700 rounded">Ctrl + S</kbd>) lalu buka Growtopia!</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">1</span>
                    <span>Press <kbd className="px-1.5 py-0.5 text-xs bg-[#e2e8f0] text-[#1e293b] border-slate-300 border border-neutral-700 rounded">⊞ Win + R</kbd></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">2</span>
                    <span>Type <code className="text-xs font-mono text-emerald-300 bg-[#e2e8f0] text-[#1e293b] border-slate-300 px-1 py-0.5 rounded">C:\Windows\System32\drivers\etc</code></span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">3</span>
                    <span>Find the file named <strong className="text-white">hosts</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">4</span>
                    <span>Right-click and open with Notepad as Administrator.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">5</span>
                    <div className="w-full">
                      <span>Add these lines to the bottom:</span>
                      <div className="mt-1.5 p-2 rounded-lg bg-[#f1f5f9] text-[#1e293b] border-2 border-[#2563eb] font-mono text-xs text-[#2563eb] font-bold border border-emerald-500/30 flex items-center justify-between">
                        <pre>15.235.227.241 www.growtopia1.com{'\n'}15.235.227.241 www.growtopia2.com</pre>
                        <button
                          onClick={onCopyIpOnly}
                          className="px-2 py-1 bg-emerald-500 text-black font-sans font-semibold rounded text-[11px] hover:bg-emerald-400 shrink-0 ml-2"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="step-box-num mt-0.5">6</span>
                    <span>Save file (<kbd className="px-1.5 py-0.5 text-xs bg-[#e2e8f0] text-[#1e293b] border-slate-300 border border-neutral-700 rounded">Ctrl + S</kbd>) and launch Growtopia!</span>
                  </li>
                </>
              )}
            </ol>
          </div>
        </div>

        {/* Tips Box */}
        <div className="p-4 bg-emerald-500/10 border-t border-emerald-500/20 text-xs text-[#334155] flex items-center gap-2">
          <svg className="w-4 h-4 text-[#3ee0a2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.375 8.625L20 8l1.375-.625L22 6l.625 1.375L24 8l-1.375.625L22 10l-.625-1.375ZM18.05 3.95L16 3l2.05-.95L19 0l.95 2.05L22 3l-2.05.95L19 6l-.95-2.05ZM9 22q-.825 0-1.413-.588T7 20h4q0 .825-.588 1.413T9 22Zm-3-3q-.425 0-.713-.288T5 18q0-.425.288-.713T6 17h6q.425 0 .713.288T13 18q0 .425-.288.713T12 19H6Zm-.75-3q-1.725-1.025-2.738-2.75T1.5 9.5q0-3.125 2.188-5.313T9 2q3.125 0 5.313 2.188T16.5 9.5q0 2.025-1.012 3.75T12.75 16h-7.5Z" />
          </svg>
          <div>
            <strong className="text-[#2563eb] font-bold">Tips: </strong>
            <span>
              {lang === 'id'
                ? 'Pastikan aplikasi pendukung (PowerTunnel, Hosts Go, atau Surge 5) sudah terinstall sebelum mencoba menghubungkan ke server.'
                : 'Make sure your network tool (PowerTunnel, Hosts Go, or Surge 5) is installed before attempting to connect.'}
            </span>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-2 p-3 bg-[#f1f5f9] text-[#1e293b] border-2 border-[#2563eb]/60 border-t border-white/5">
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx ? 'w-8 h-3.5 bg-[#2563eb] border-2 border-[#1e40af]' : 'w-3.5 h-3.5 bg-[#cbd5e1] border-2 border-[#94a3b8] hover:bg-[#94a3b8]'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
