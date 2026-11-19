import React from 'react'

export default function EduNexusLogo({ size = 38, darkText = false, showTagline = false }) {
  return (
    <div className="flex items-center gap-3">
      {/* Logo image */}
      <img
        src="/edunexus-logo.svg"
        alt="EduNexus"
        style={{ width: size, height: size }}
        className="flex-shrink-0 drop-shadow-md"
      />

      {/* Wordmark */}
      <div className="leading-none">
        <p
          className={`font-extrabold text-base leading-none tracking-tight ${
            darkText ? 'text-gray-900' : 'text-white'
          }`}
        >
          Edu<span className="text-blue-500">Nexus</span>
        </p>
        {showTagline && (
          <p
            className={`text-[10px] leading-none mt-1 tracking-wide ${
              darkText ? 'text-gray-400' : 'text-blue-200'
            }`}
          >
            Learn • Grow • Build Your Future
          </p>
        )}
        {!showTagline && (
          <p
            className={`text-xs leading-none mt-0.5 ${
              darkText ? 'text-blue-600' : 'text-blue-200'
            }`}
          >
            Academia Portal
          </p>
        )}
      </div>
    </div>
  )
}
