'use client'

import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl bg-[#0d0f1d]">
      {/* Left half */}
      <div className="absolute left-0 top-0 h-full md:w-[336px] w-[152px] overflow-hidden [clip-path:inset(0)]">
        <div className="z-2 absolute inset-0 bg-linear-to-l from-[#0c0f1d] from-30% to-[#0c0f1d00] to-80%" />
        <DotLottieReact
          src="/animations/grid_loop.lottie"
          layout={{ fit: 'cover', align: [0, 0] }}
          renderConfig={{ autoResize: true }}
          autoplay={true}
          loop={true}
        />
      </div>

      {/* Right half */}
      <div className="absolute right-0 top-0 h-full md:w-[336px] w-[152px] overflow-hidden [clip-path:inset(0)]">
        <div className="z-2 absolute inset-0 bg-linear-to-r from-[#0c0f1d] from-30% to-[#0c0f1d00] to-80%" />
        <DotLottieReact
          src="/animations/grid_loop.lottie"
          style={{ transform: 'rotate(180deg)' }}
          layout={{ fit: 'cover', align: [0.01, 0] }}
          renderConfig={{ autoResize: true }}
          autoplay={true}
          loop={true}
        />
      </div>
    </div>
  )
}
