import BrandLogo from '../components/BrandLogo'
import SparshBotanical from '../components/SparshBotanical'
import Icon from '../components/Icon'

function HeroChildDevelopmentVisual({ className = 'w-full h-auto max-w-md' }) {
  return (
    <svg
      viewBox="0 0 420 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Early childhood developmental milestone illustration"
    >
      {/* Background Soft Organic Sun & Warm Aura */}
      <circle cx="210" cy="115" r="95" fill="#F4F8F5" />
      <circle cx="210" cy="115" r="70" fill="#EBF2EE" fillOpacity="0.8" />
      <circle cx="250" cy="65" r="22" fill="#FDF0EB" />
      <circle cx="250" cy="65" r="14" fill="#D96B43" fillOpacity="0.85" />

      {/* Distant Rolling Hills in Sage Tones */}
      <path
        d="M0 210C60 185 140 180 220 195C300 210 360 195 420 205V250H0V210Z"
        fill="#E2ECE6"
      />
      <path
        d="M0 220C80 205 180 212 260 218C340 224 380 215 420 222V250H0V220Z"
        fill="#D5E3DB"
      />

      {/* Decorative Botanical Foliage - Left Side */}
      <g transform="translate(15, 110)">
        <path d="M25 90C15 65 30 40 50 30C45 55 35 75 25 90Z" fill="#729082" />
        <path d="M40 95C25 80 20 60 30 45C42 60 42 78 40 95Z" fill="#8FA89B" />
        <path d="M10 100C5 85 12 70 25 65C22 80 18 92 10 100Z" fill="#52796F" />
        <circle cx="48" cy="28" r="4.5" fill="#D96B43" />
        <circle cx="22" cy="60" r="3.5" fill="#D96B43" />
      </g>

      {/* Decorative Botanical Foliage - Right Side */}
      <g transform="translate(330, 115)">
        <path d="M55 85C65 60 50 35 30 25C35 50 45 70 55 85Z" fill="#729082" />
        <path d="M40 90C55 75 60 55 50 40C38 55 38 73 40 90Z" fill="#8FA89B" />
        <path d="M70 95C75 80 68 65 55 60C58 75 62 87 70 95Z" fill="#52796F" />
        <circle cx="32" cy="23" r="4.5" fill="#D96B43" />
        <circle cx="58" cy="55" r="3.5" fill="#D96B43" />
      </g>

      {/* MOTHER / ANGANWADI WORKER (Gentle supportive posture on the left) */}
      <g transform="translate(125, 75)">
        {/* Hair Bun with Jasmine Accent */}
        <circle cx="48" cy="32" r="13" fill="#1A201E" />
        <circle cx="38" cy="35" r="15" fill="#1A201E" />
        <circle cx="53" cy="26" r="3.5" fill="#EBF2EE" />
        <circle cx="58" cy="30" r="3" fill="#EBF2EE" />

        {/* Head & Neck */}
        <circle cx="42" cy="42" r="11" fill="#C87A54" />
        <circle cx="45" cy="39" r="1.5" fill="#D32F2F" /> {/* Bindi */}

        {/* Saree & Torso leaning tenderly forward */}
        <path
          d="M28 65C20 80 18 105 20 135C26 137 45 138 60 135C54 120 50 102 48 80C42 75 34 70 28 65Z"
          fill="#1B4D3E"
        />
        <path
          d="M48 80C50 102 54 120 60 135C72 133 84 128 90 120C88 105 80 92 72 82C60 78 52 79 48 80Z"
          fill="#52796F"
        />

        {/* Saree Pallu & Accent Fold in Terracotta */}
        <path
          d="M32 68L50 95L58 92L42 66C38 66 35 67 32 68Z"
          fill="#D96B43"
        />

        {/* Supportive Outstretched Arm & Hand guiding the child */}
        <path
          d="M58 84C68 90 82 92 98 88"
          stroke="#C87A54"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M52 78C62 82 72 84 82 82"
          stroke="#1B4D3E"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </g>

      {/* TODDLER TAKING FIRST INDEPENDENT STEPS ("Early Steps") */}
      <g transform="translate(240, 105)">
        {/* Child Head */}
        <circle cx="30" cy="28" r="12" fill="#C87A54" />
        {/* Child Hair */}
        <path
          d="M20 24C20 15 27 12 36 12C44 12 47 18 45 27C42 24 38 22 34 22C28 22 22 26 20 24Z"
          fill="#1A201E"
        />

        {/* Toddler Kurta in Warm Terracotta */}
        <path
          d="M18 42C14 55 15 72 16 90C25 92 38 92 46 90C47 74 48 55 44 42C36 40 26 40 18 42Z"
          fill="#D96B43"
        />

        {/* Arms outstretched in balance (Milestone walking gesture) */}
        <path
          d="M18 46C6 44 -2 38 -8 42"
          stroke="#C87A54"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M44 46C54 44 64 40 70 45"
          stroke="#C87A54"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Legs stepping forward */}
        <path
          d="M23 90V105"
          stroke="#C87A54"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M39 90L44 104"
          stroke="#C87A54"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Small feet */}
        <ellipse cx="21" cy="107" rx="4" ry="2" fill="#C87A54" />
        <ellipse cx="46" cy="106" rx="4" ry="2" fill="#C87A54" />
      </g>

      {/* Gentle Floating Sprout Accents Grounding the Scene */}
      <g transform="translate(195, 212)">
        <path d="M10 18C12 8 18 2 24 0" stroke="#729082" strokeWidth="2" strokeLinecap="round" />
        <path d="M24 0C30 0 35 4 37 10C30 9 26 5 24 0Z" fill="#729082" />
        <path d="M18 5C14 2 8 4 6 10C12 9 16 7 18 5Z" fill="#8FA89B" />
        <circle cx="25" cy="12" r="2.5" fill="#D96B43" />
      </g>
    </svg>
  )
}

export default function SplashScreen({ onContinue }) {
  return (
    <main className="min-h-screen w-full bg-white relative overflow-hidden flex flex-col justify-between">
      {/* ============================================================== */}
      {/* DESKTOP VIEW (>= 1024px): EXPANDED FULL-VIEWPORT COMPOSITION   */}
      {/* ============================================================== */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:min-h-screen lg:w-full">
        {/* Left Section: Brand, Large Hero Illustration & Trust Points */}
        <section className="lg:col-span-7 xl:col-span-7 bg-white p-12 xl:p-16 flex flex-col justify-between relative overflow-hidden">
          <SparshBotanical variant="top-left" opacity="opacity-30" />
          <SparshBotanical variant="bottom-left" opacity="opacity-20" />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <BrandLogo className="h-12 w-12" showWordmark showTagline stacked={false} />
          </div>

          {/* Center: Large Integrated Hero Visual + Headline */}
          <div className="relative z-10 py-6 space-y-6 max-w-xl">
            <div className="flex flex-col items-start gap-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EBF2EE] px-3.5 py-1 text-xs font-semibold text-[#1B4D3E] border border-[#D5E3DB]">
                Developmental Screening &amp; Follow-up Support
              </span>
              <h1 className="text-3xl xl:text-4xl font-extrabold text-[#1A201E] tracking-tight font-heading leading-tight">
                Supporting Every Child&apos;s <br />
                Brighter Tomorrow
              </h1>
              <p className="text-sm text-[#5A6660] leading-relaxed max-w-lg">
                Empowering Anganwadi workers with RBSK 5-domain developmental surveillance, automated delay detection, and immediate clinical DEIC referral.
              </p>
            </div>

            {/* Large Hero Illustration (35-40% visual presence) */}
            <div className="pt-2 w-full flex justify-center">
              <HeroChildDevelopmentVisual className="w-full max-w-lg h-auto drop-shadow-xs" />
            </div>

            {/* Core Trust Pillars */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#E5EBE7]">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#1A201E]">RBSK Standard</p>
                <p className="text-[11px] text-[#5A6660]">5-Domain Checklist</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#1A201E]">Offline-First</p>
                <p className="text-[11px] text-[#5A6660]">IndexedDB Local Queue</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#1A201E]">DEIC Referral</p>
                <p className="text-[11px] text-[#5A6660]">Official Form 3A Docket</p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 text-xs text-[#8E9C95]">
            <p>SPARSH Child Health Companion · Ministry of Health & Family Welfare</p>
          </div>
        </section>

        {/* Right Section: Dark Forest Green Hero Panel */}
        <section className="lg:col-span-5 xl:col-span-5 bg-[#1B4D3E] text-white p-12 xl:p-16 flex flex-col justify-between relative overflow-hidden">
          <SparshBotanical variant="top-right" opacity="opacity-25" />
          <SparshBotanical variant="bottom-right" opacity="opacity-20" />

          {/* Upper Badge */}
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-[#D2E3D8] border border-white/20">
              Anganwadi Frontline Portal
            </span>
          </div>

          {/* Center Message */}
          <div className="relative z-10 space-y-4 my-auto py-8 max-w-md">
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight font-heading leading-tight">
              Early Steps <br />
              Brighter Futures
            </h2>
            <p className="text-sm xl:text-base text-[#D2E3D8] leading-relaxed">
              A digital companion for Anganwadi workers to track and support child development across frontline communities in India.
            </p>
          </div>

          {/* Action Area */}
          <div className="relative z-10 space-y-3">
            <button
              type="button"
              onClick={onContinue}
              className="w-full min-h-[54px] rounded-2xl bg-white hover:bg-[#EBF2EE] text-[#1B4D3E] font-bold text-base shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>Get Started</span>
              <Icon name="arrowRight" className="h-5 w-5" />
            </button>
            <p className="text-center text-xs text-[#D2E3D8]/70">
              Sign in with your registered Anganwadi credentials
            </p>
          </div>
        </section>
      </div>

      {/* ============================================================== */}
      {/* MOBILE VIEW (< 1024px): STRICT MATCH TO SCREEN 1 IN REFERENCE   */}
      {/* ============================================================== */}
      <div className="lg:hidden flex flex-col min-h-screen bg-white relative">
        {/* Subtle corner foliage */}
        <SparshBotanical variant="top-right" opacity="opacity-35" />

        {/* 1. TOP HEADER: BRANDING & TITLE (Compact, intentional spacing) */}
        <header className="pt-8 pb-2 px-6 text-center relative z-10 shrink-0">
          <BrandLogo
            className="h-14 w-14 mx-auto"
            showWordmark
            showTagline
            stacked
          />
        </header>

        {/* 2. LARGE HERO VISUAL (Occupies ~35-40% of hero area, connects with lower panel) */}
        <div className="flex-1 flex items-center justify-center px-4 py-2 relative z-10">
          <HeroChildDevelopmentVisual className="w-full max-w-[340px] h-auto drop-shadow-2xs" />
        </div>

        {/* 3. GREEN CONTENT PANEL (Structured tightly with strong typography & CTA) */}
        <section className="w-full bg-[#1B4D3E] text-white rounded-t-[36px] px-6 py-7 sm:px-8 sm:py-8 space-y-5 shadow-2xl relative z-20 shrink-0">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading leading-tight">
              Early Steps <br />
              Brighter Futures
            </h2>
            <p className="text-xs sm:text-sm text-[#D2E3D8] leading-relaxed max-w-sm">
              A digital companion for Anganwadi workers to track and support child development.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={onContinue}
              className="w-full min-h-[50px] rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-sm sm:text-base shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
            >
              <span>Get Started</span>
              <Icon name="arrowRight" className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
