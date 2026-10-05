import React from 'react';
import { Download } from 'lucide-react';

export interface GoogleReviewCardArtworkProps {
  id?: string;
  qrDataUrl: string;
  cardId?: string;
  businessName?: string;
  poweredByText?: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Pixel-Perfect Google Review Card Artwork Vector SVG
 * Directly based on the user's precision Adobe Illustrator design (Modexa_Google_Review_Stand.svg):
 * - Exact viewBox="0 0 380 399"
 * - 5 golden stars centered at y=32.3
 * - "WE WOULD APPRECIATE YOUR GOOGLE REVIEW" bold uppercase headline
 * - Royal blue top with signature cyan contour accent wave
 * - Google "G" official 4-color emblem on white circular badge
 * - "TAP YOUR PHONE" precision letter-by-letter rotated arch
 * - Contactless waves ellipse + hand holding NFC smartphone
 * - Center "OR" divider
 * - "SCAN QR" over 4 Google-colored rounded corner brackets + dynamic QR code
 * - Clean footer branding and hardware Card ID
 */
export const GoogleReviewCardArtwork: React.FC<GoogleReviewCardArtworkProps> = ({
  id,
  qrDataUrl,
  cardId = 'CRD-0001',
  businessName,
  poweredByText = 'Powered by Modexa',
  width = 380,
  height = 399,
  style,
  className,
}) => {
  const safeId = (cardId || '0001').replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `blue-grad-${safeId}`;
  const starGlowId = `star-glow-${safeId}`;
  const shadowId = `shadow-${safeId}`;

  return (
    <svg
      id={id || `card-artwork-svg-${cardId}`}
      width={width}
      height={height}
      viewBox="0 0 380 399"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      className={className}
      style={{
        display: 'block',
        borderRadius: '19px',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        ...style,
      }}
    >
      <defs>
        {/* Rich Royal Blue Header Gradient */}
        <linearGradient id={gradId} x1="0" y1="0" x2="380" y2="197.6" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0731bd" />
          <stop offset="100%" stopColor="#0b3cbf" />
        </linearGradient>

        {/* Star Glow Filter */}
        <filter id={starGlowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" floodColor="#D97706" floodOpacity="0.35" stdDeviation="1.2" />
        </filter>

        {/* Google G Medallion Soft Shadow */}
        <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" floodColor="#000000" floodOpacity="0.16" stdDeviation="3.5" />
        </filter>
      </defs>

      {/* Pure White Base Background Canvas */}
      <rect width="380" height="399" rx="19" ry="19" fill="#FFFFFF" />

      {/* Top Royal Blue Background with Curved Wave Boundary */}
      <path d="M0,0h380v197.6c-95,0-133,19-190,19S95,197.6,0,197.6V0Z" fill={`url(#${gradId})`} />

      {/* Signature Cyan Accent Curve at Wave Junction */}
      <path
        d="M0,197.6c95,0,133,19,190,19s95-19,190-19"
        stroke="#00a8ff"
        strokeWidth="4.27"
        strokeLinecap="round"
        strokeMiterlimit="3.8"
        fill="none"
      />

      {/* 5 Solid Golden Stars Centered at Top */}
      <g id="topStars" filter={`url(#${starGlowId})`}>
        {[125.4, 157.7, 190, 222.3, 254.6].map((cx, idx) => (
          <path
            key={idx}
            d={`M${cx},32.3l3.61,8.07h8.55l-6.94,5.03,2.56,8.27-7.79-5.03-7.79,5.03,2.56-8.27-6.94-5.03h8.55l3.61-8.07Z`}
            fill="#ffd000"
            stroke="#f59e0b"
            strokeLinejoin="round"
            strokeWidth="0.47"
          />
        ))}
      </g>

      {/* Optional Business Name Header Tag */}
      {businessName && (
        <text
          x="190"
          y="72"
          textAnchor="middle"
          fill="#BAE6FD"
          fontFamily="Arial, 'Inter', sans-serif"
          fontWeight="700"
          fontSize="10.5"
          letterSpacing="0.04em"
        >
          {businessName.toUpperCase()}
        </text>
      )}

      {/* Bold White Capital Headline Text */}
      <text
        transform={businessName ? "translate(51.47 98.9)" : "translate(51.47 96.9)"}
        fill="#FFFFFF"
        fontFamily="Arial, 'Inter', sans-serif"
        fontWeight="800"
        fontSize="19.95"
        letterSpacing="0.02em"
      >
        WE WOULD APPRECIATE
      </text>
      <text
        transform={businessName ? "translate(57.51 127.4)" : "translate(57.51 125.4)"}
        fill="#FFFFFF"
        fontFamily="Arial, 'Inter', sans-serif"
        fontWeight="800"
        fontSize="19.95"
        letterSpacing="0.02em"
      >
        YOUR GOOGLE REVIEW
      </text>

      {/* ========================================================
          CENTER MEDALLION: GOOGLE "G" EMBLEM ON WHITE CIRCLE
          ======================================================== */}
      <g id="googleMedallion" filter={`url(#${shadowId})`}>
        {/* White Circular Medallion */}
        <circle cx="190" cy="212.8" r="39.9" fill="#FFFFFF" stroke="#f8fafc" strokeWidth="0.95" />

        {/* Official Google 4-Color "G" Icon */}
        <g>
          {/* Blue segment */}
          <path
            d="M212.6,213.25c0-1.71-.2-3.32-.5-4.93h-22.15v9.16h12.79c-.6,3.02-2.42,5.54-5.14,7.25v6.24h7.75c4.53-4.13,7.25-10.37,7.25-17.72Z"
            fill="#4285f4"
          />
          {/* Green segment */}
          <path
            d="M189.94,236.41c6.34,0,11.78-2.11,15.51-5.44l-7.75-6.24c-2.11,1.41-4.73,2.32-7.75,2.32-6.14,0-11.38-4.13-13.19-9.77h-8.06v6.44c3.93,7.55,11.98,12.69,21.25,12.69Z"
            fill="#34a853"
          />
          {/* Yellow segment */}
          <path
            d="M176.75,217.27c-.5-1.41-.81-2.92-.81-4.53s.3-3.12.81-4.53v-6.44h-8.06c-1.71,3.42-2.72,7.05-2.72,10.98s1.01,7.55,2.72,10.98l8.06-6.44Z"
            fill="#fbbc05"
          />
          {/* Red segment */}
          <path
            d="M189.94,198.44c3.52,0,6.65,1.21,9.06,3.52l6.75-6.75c-4.13-3.83-9.47-6.14-15.81-6.14-9.26,0-17.32,5.14-21.25,12.69l8.06,6.44c1.81-5.64,7.05-9.77,13.19-9.77Z"
            fill="#ea4335"
          />
        </g>
      </g>

      {/* ========================================================
          LEFT SECTION: TAP YOUR PHONE & CONTACTLESS ILLUSTRATION
          ======================================================== */}
      <g id="leftTapSection">
        {/* Precision Letter-by-Letter Rotated Arch for TAP YOUR PHONE */}
        <g id="tapYourPhoneText" fill="#0f172a" fontFamily="Arial, sans-serif" fontWeight="700">
          <text transform="translate(42.59 282.12) rotate(-19.46) scale(.97 1) skewX(-1.39)" fontSize="11.83"><tspan x="0" y="0">T</tspan></text>
          <text transform="translate(49.9 279.54) rotate(-16.66) scale(.97 1) skewX(-1.22)" fontSize="11.84"><tspan x="0" y="0">A</tspan></text>
          <text transform="translate(58.54 276.98) rotate(-13.63) scale(.97 1) skewX(-1.01)" fontSize="11.85"><tspan x="0" y="0">P</tspan></text>
          <text transform="translate(66.68 275.07) rotate(-11.4) scale(.96 1) skewX(-.86)" fontSize="11.86"><tspan x="0" y="0"> </tspan></text>
          <text transform="translate(70.51 274.27) rotate(-9.13) scale(.96 1) skewX(-.69)" fontSize="11.86"><tspan x="0" y="0">Y</tspan></text>
          <text transform="translate(78.77 272.94) rotate(-5.72) scale(.96 1) skewX(-.44)" fontSize="11.87"><tspan x="0" y="0">O</tspan></text>
          <text transform="translate(88.35 272.01) rotate(-2.13) scale(.96 1) skewX(-.16)" fontSize="11.87"><tspan x="0" y="0">U</tspan></text>
          <text transform="translate(97.32 271.7) rotate(1.36) scale(.96 1) skewX(.1)" fontSize="11.88"><tspan x="0" y="0">R</tspan></text>
          <text transform="translate(106.3 271.98) rotate(3.85) scale(.96 1) skewX(.3)" fontSize="11.87"><tspan x="0" y="0"> </tspan></text>
          <text transform="translate(110.2 272.22) rotate(6.21) scale(.96 1) skewX(.48)" fontSize="11.87"><tspan x="0" y="0">P</tspan></text>
          <text transform="translate(118.51 273.13) rotate(9.49) scale(.96 1) skewX(.72)" fontSize="11.86"><tspan x="0" y="0">H</tspan></text>
          <text transform="translate(127.38 274.63) rotate(12.91) scale(.97 1) skewX(.96)" fontSize="11.85"><tspan x="0" y="0">O</tspan></text>
          <text transform="translate(136.77 276.81) rotate(16.19) scale(.97 1) skewX(1.18)" fontSize="11.84"><tspan x="0" y="0">N</tspan></text>
          <text transform="translate(145.41 279.35) rotate(19.12) scale(.97 1) skewX(1.37)" fontSize="11.83"><tspan x="0" y="0">E</tspan></text>
        </g>

        {/* Contactless Ellipse with Radiating Concentric Signal Waves */}
        <g id="contactlessWaves">
          <ellipse cx="90.27" cy="308.24" rx="24.7" ry="17.1" fill="#FFFFFF" stroke="#0f172a" strokeWidth="1.9" strokeMiterlimit="3.8" />
          <path d="M78.29,300.67c3.55,0,6.42,3.39,6.42,7.57s-2.87,7.57-6.42,7.57" stroke="#0f172a" strokeWidth="2.09" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />
          <path d="M85.89,298.4c5.31,2.17,7.9,8.33,5.77,13.77-1.05,2.69-3.14,4.83-5.77,5.9" stroke="#0f172a" strokeWidth="2.09" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />
          <path d="M93.49,296.13c6.64,3.45,9.25,11.66,5.82,18.34-1.29,2.52-3.32,4.57-5.82,5.87" stroke="#0f172a" strokeWidth="2.09" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />
        </g>

        {/* Hand Holding Smartphone Vector with NFC on Screen */}
        <g id="handWithPhone">
          {/* Curled Fingers on Left */}
          <path d="M106.22,325.58c-5.02,0-6.45,1.69-6.45,3.39s1.43,3.05,6.45,3.05" stroke="#0f172a" strokeWidth="1.71" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />
          <path d="M106.22,332.36c-5.02,0-6.45,1.69-6.45,3.39s1.43,3.05,6.45,3.05" stroke="#0f172a" strokeWidth="1.71" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />
          <path d="M106.22,339.13c-5.02,0-6.45,1.69-6.45,3.39s1.43,3.05,6.45,3.05" stroke="#0f172a" strokeWidth="1.71" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />

          {/* Phone Body Outline */}
          <path
            d="M122.51,344.27v1.3c0,1.58-1.28,2.87-2.87,2.87h-12.82c-1.58,0-2.87-1.28-2.87-2.87v-27.23c0-1.58,1.28-2.87,2.87-2.87h12.82c1.58,0,2.87,1.28,2.87,2.87v19.89"
            stroke="#0f172a"
            strokeWidth="1.9"
            strokeMiterlimit="3.8"
            fill="#FFFFFF"
          />

          {/* Palm & Wrist */}
          <path d="M122.88,327.22c4.28,1.01,7.57,4.42,10.08,12.95.72,2.43,1.86,5.34,4.48,9.15" stroke="#0f172a" strokeWidth="1.71" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />
          {/* Thumb */}
          <path d="M124.14,339.63c-3.6-3.77-8.79.62,1.59,7.22" stroke="#0f172a" strokeWidth="1.71" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />

          {/* Screen Content: Notch, Bold NFC, Screen Waves */}
          <line x1="110.99" y1="318.35" x2="115.78" y2="318.35" stroke="#0f172a" strokeWidth="1.33" strokeLinecap="round" strokeMiterlimit="3.8" />
          <text transform="translate(107.26 329.91)" fontSize="5.37" fill="#0f172a" fontFamily="Arial, sans-serif" fontWeight="800">
            NFC
          </text>
          <path d="M109.08,334.4c2.87-1.43,5.73-1.43,8.6,0" stroke="#0b63e5" strokeWidth="1.23" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />
          <path d="M110.52,336.55c1.91-.96,3.82-.96,5.73,0" stroke="#0b63e5" strokeWidth="1.23" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />
          <path d="M111.66,338.99c1.15-.57,2.3-.57,3.45,0" stroke="#0b63e5" strokeWidth="1.23" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />
        </g>
      </g>

      {/* ========================================================
          CENTER DIVIDER: THIN LINE + BOLD "OR"
          ======================================================== */}
      <line x1="190" y1="275.5" x2="190" y2="305.9" stroke="#cbd5e1" strokeWidth="1.33" strokeLinecap="round" strokeMiterlimit="3.8" />
      <text transform="translate(181.62 318.98)" fill="#475569" fontSize="10.93" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="0.03em">
        OR
      </text>
      <line x1="190" y1="326.8" x2="190" y2="357.2" stroke="#cbd5e1" strokeWidth="1.33" strokeLinecap="round" strokeMiterlimit="3.8" />

      {/* ========================================================
          RIGHT SECTION: "SCAN QR" + 4-COLOR BRACKETS + QR
          ======================================================== */}
      <g id="rightQrSection">
        <text transform="translate(252.63 262.2)" fill="#0f172a" fontSize="12.35" fontFamily="Arial, sans-serif" fontWeight="700" letterSpacing="0.05em">
          SCAN QR
        </text>

        <g id="cornerBrackets">
          {/* Top-Left Bracket (Red #EA4335) */}
          <path d="M238.45,286.9v-12.35c0-1.57,1.28-2.85,2.85-2.85h12.35" stroke="#ea4335" strokeWidth="2.85" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />
          {/* Top-Right Bracket (Yellow #FBBC05) */}
          <path d="M312.55,271.7h12.35c1.57,0,2.85,1.28,2.85,2.85v12.35" stroke="#fbbc05" strokeWidth="2.85" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />
          {/* Bottom-Left Bracket (Green #34A853) */}
          <path d="M238.45,345.8v12.35c0,1.57,1.28,2.85,2.85,2.85h12.35" stroke="#34a853" strokeWidth="2.85" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />
          {/* Bottom-Right Bracket (Blue #4285F4) */}
          <path d="M312.55,361h12.35c1.57,0,2.85-1.28,2.85-2.85v-12.35" stroke="#4285f4" strokeWidth="2.85" strokeLinecap="round" strokeMiterlimit="3.8" fill="none" />

          {/* Crisp Dynamic QR Image inside brackets */}
          {qrDataUrl && (
            <image
              href={qrDataUrl}
              x="243.5"
              y="276.8"
              width="78"
              height="78"
              preserveAspectRatio="xMidYMid meet"
            />
          )}
        </g>
      </g>

      {/* ========================================================
          BOTTOM FOOTER: BRANDING & CARD HARDWARE ID
          ======================================================== */}
      <text transform="translate(143.71 383.8)" fill="#4a5868" fontSize="9.97" fontFamily="Arial, sans-serif" fontWeight="700">
        <tspan fontFamily="Arial, sans-serif" x="0" y="0">{poweredByText.replace(/Modexa.*/, 'Powered by ')}</tspan>
        <tspan x="55.45" y="0">Modexa</tspan>
      </text>

      <text transform="translate(328.31 387.6)" fill="#94a3b8" fontFamily="'Courier New', monospace" fontSize="7.6" fontWeight="700">
        <tspan x="0" y="0">{cardId}</tspan>
      </text>
    </svg>
  );
};

export interface GoogleReviewAcrylicStandProps {
  qrDataUrl: string;
  cardId?: string;
  businessName?: string;
  poweredByText?: string;
  size?: number; // base size in px (default 380)
}

/**
 * Clean Flat 2D Display Component
 * Renders the exact physical Google Review Card without any 3D perspective distortion or tilt.
 */
export const GoogleReviewAcrylicStand: React.FC<GoogleReviewAcrylicStandProps> = ({
  qrDataUrl,
  cardId = 'CRD-0001',
  businessName,
  poweredByText = 'Powered by Modexa',
  size = 380,
}) => {
  // Download SVG Action
  const handleDownloadSVG = () => {
    const svgElement = document.getElementById(`acrylic-stand-svg-${cardId}`);
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Modexa_Google_Review_Stand_${cardId}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Action Bar: Download SVG */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: `${size + 24}px`,
          marginBottom: '12px',
          padding: '6px 12px',
          backgroundColor: '#F8FAFC',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          fontSize: '12px',
          color: '#475569',
        }}
      >
        <span style={{ fontWeight: 600, color: '#334155' }}>
          Exact Production Card ({cardId})
        </span>

        <button
          type="button"
          onClick={handleDownloadSVG}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#0B63E5',
            color: '#FFFFFF',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          <Download size={13} />
          <span>Download SVG</span>
        </button>
      </div>

      {/* Flat Card Frame (Clean, crisp, no 3D distortion) */}
      <div
        style={{
          padding: '6px',
          borderRadius: '24px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)',
          position: 'relative',
        }}
      >
        <GoogleReviewCardArtwork
          id={`acrylic-stand-svg-${cardId}`}
          width={size}
          height={size * (399 / 380)}
          qrDataUrl={qrDataUrl}
          cardId={cardId}
          businessName={businessName}
          poweredByText={poweredByText}
        />
      </div>
    </div>
  );
};
