import React from 'react'

export interface SkeletonPose {
  headTilt?: number;      // Degrees (-20 to 20)
  torsoLean?: number;     // Degrees (-15 to 15)
  leftShoulder?: number;  // Degrees (-180 to 180)
  leftElbow?: number;     // Degrees (-150 to 0)
  rightShoulder?: number; // Degrees (-180 to 180)
  rightElbow?: number;    // Degrees (0 to 150)
  leftHip?: number;       // Degrees (-60 to 60)
  leftKnee?: number;      // Degrees (0 to 120)
  rightHip?: number;      // Degrees (-60 to 60)
  rightKnee?: number;     // Degrees (0 to 120)
  mouthOpen?: number;     // 0 to 1 (optional audio-reactive ring pulse)
}

interface CuriosityStickmanProps {
  pose?: SkeletonPose;
  className?: string;
}

export const CuriosityStickman: React.FC<CuriosityStickmanProps> = ({
  pose = {},
  className = 'w-96 h-[560px]',
}) => {
  const {
    headTilt = 0,
    torsoLean = 0,
    leftShoulder = 25,
    leftElbow = -35,
    rightShoulder = -30,
    rightElbow = 45,
    leftHip = 10,
    leftKnee = 5,
    rightHip = -10,
    rightKnee = 5,
    mouthOpen = 0,
  } = pose;

  return (
    <svg
      viewBox="0 0 400 560"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Subtle glow for the logo head */}
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ================= ROOT PELVIS / HIP JOINT (200, 340) ================= */}
      <g id="skeleton-root" transform="translate(200, 340)">

        {/* ---------------- LEFT LEG (Viewer's Left) ---------------- */}
        <g id="left-hip" transform={`rotate(${leftHip})`}>
          {/* Thigh */}
          <line
            x1="0" y1="0" x2="-22" y2="85"
            stroke="#e4e4e7" strokeWidth="10" strokeLinecap="round"
          />
          {/* Left Knee Joint */}
          <g id="left-knee" transform={`translate(-22, 85) rotate(${leftKnee})`}>
            {/* Shin */}
            <line
              x1="0" y1="0" x2="-8" y2="85"
              stroke="#e4e4e7" strokeWidth="10" strokeLinecap="round"
            />
            {/* Foot */}
            <line
              x1="-8" y1="85" x2="-28" y2="85"
              stroke="#e4e4e7" strokeWidth="10" strokeLinecap="round"
            />
          </g>
        </g>

        {/* ---------------- RIGHT LEG (Viewer's Right) ---------------- */}
        <g id="right-hip" transform={`rotate(${rightHip})`}>
          {/* Thigh */}
          <line
            x1="0" y1="0" x2="22" y2="85"
            stroke="#e4e4e7" strokeWidth="10" strokeLinecap="round"
          />
          {/* Right Knee Joint */}
          <g id="right-knee" transform={`translate(22, 85) rotate(${rightKnee})`}>
            {/* Shin */}
            <line
              x1="0" y1="0" x2="8" y2="85"
              stroke="#e4e4e7" strokeWidth="10" strokeLinecap="round"
            />
            {/* Foot */}
            <line
              x1="8" y1="85" x2="28" y2="85"
              stroke="#e4e4e7" strokeWidth="10" strokeLinecap="round"
            />
          </g>
        </g>

        {/* ---------------- TORSO & UPPER BODY ---------------- */}
        <g id="torso" transform={`rotate(${torsoLean})`}>
          {/* Spine */}
          <line
            x1="0" y1="0" x2="0" y2="-115"
            stroke="#e4e4e7" strokeWidth="11" strokeLinecap="round"
          />

          {/* ---------------- LEFT ARM (Shoulder at 0, -100) ---------------- */}
          <g id="left-shoulder" transform={`translate(0, -100) rotate(${leftShoulder})`}>
            {/* Upper Arm */}
            <line
              x1="0" y1="0" x2="-55" y2="45"
              stroke="#e4e4e7" strokeWidth="9" strokeLinecap="round"
            />
            {/* Left Elbow Joint */}
            <g id="left-elbow" transform={`translate(-55, 45) rotate(${leftElbow})`}>
              {/* Forearm */}
              <line
                x1="0" y1="0" x2="-45" y2="45"
                stroke="#e4e4e7" strokeWidth="9" strokeLinecap="round"
              />
              {/* Hand / Pointer */}
              <circle cx="-45" cy="45" r="7" fill="#38bdf8" />
            </g>
          </g>

          {/* ---------------- RIGHT ARM (Shoulder at 0, -100) ---------------- */}
          <g id="right-shoulder" transform={`translate(0, -100) rotate(${rightShoulder})`}>
            {/* Upper Arm */}
            <line
              x1="0" y1="0" x2="55" y2="45"
              stroke="#e4e4e7" strokeWidth="9" strokeLinecap="round"
            />
            {/* Right Elbow Joint */}
            <g id="right-elbow" transform={`translate(55, 45) rotate(${rightElbow})`}>
              {/* Forearm */}
              <line
                x1="0" y1="0" x2="45" y2="45"
                stroke="#e4e4e7" strokeWidth="9" strokeLinecap="round"
              />
              {/* Hand / Pointer */}
              <circle cx="45" cy="45" r="7" fill="#38bdf8" />
            </g>
          </g>

          {/* ---------------- NECK & LOGO HEAD (Neck pivot at 0, -115) ---------------- */}
          <g
            id="head-pivot"
            transform={`translate(0, -115) rotate(${headTilt})`}
          >
            {/* Head Center offset upwards so neck attaches cleanly to bottom of ring */}
            <g
              id="logo-head"
              transform={`translate(0, -95) scale(${1 + mouthOpen * 0.04})`}
            >
              {/* Solid dark backing circle so torso lines don't bleed through */}
              <circle cx="0" cy="0" r="84" fill="#050507" />

              {/* Outer Textured Lavender Brush-Stroke Ring */}
              <g filter="url(#logoGlow)">
                {/* Main Thick Brush Arc */}
                <path
                  d="M -15 -84 A 85 85 0 1 1 -55 -65"
                  stroke="#b39ddb"
                  strokeWidth="11"
                  strokeLinecap="round"
                />
                {/* Secondary Overlapping Tapered Brush Strokes (Top-Left Split Effect) */}
                <path
                  d="M -68 -50 A 83 83 0 0 1 28 -79"
                  stroke="#b39ddb"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <path
                  d="M -78 -32 A 86 86 0 0 1 12 -84"
                  stroke="#b39ddb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <path
                  d="M -45 -72 A 80 80 0 0 1 42 -72"
                  stroke="#b39ddb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.7"
                />
                {/* Bottom-Left Brush Feathering */}
                <path
                  d="M -52 68 A 84 84 0 0 1 -83 -15"
                  stroke="#b39ddb"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M -35 78 A 87 87 0 0 1 -75 38"
                  stroke="#b39ddb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.75"
                />
                {/* Right Edge Thin Wispy Stroke */}
                <path
                  d="M 75 -38 A 86 86 0 0 1 78 34"
                  stroke="#b39ddb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />
              </g>

              {/* Center Logo Typography */}
              <text
                x="0"
                y="-12"
                textAnchor="middle"
                fill="#ffffff"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="700"
                fontSize="16.5"
                letterSpacing="-0.3"
              >
                Daily Dose Of
              </text>

              <text
                x="0"
                y="22"
                textAnchor="middle"
                fill="#22a7f0"
                fontFamily="Inter, system-ui, sans-serif"
                fontWeight="800"
                fontSize="31"
                letterSpacing="-0.8"
              >
                Curiosity
              </text>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

export default CuriosityStickman;
