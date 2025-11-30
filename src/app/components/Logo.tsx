export default function Logo(){
    return(
         <div>
          <svg width="80" height="60" viewBox="0 0 400 200">
            {/* Play circle */}
            <circle cx="60" cy="80" r="40" fill="url(#grad)" />
            <polygon points="50,60 50,100 80,80" fill="white" />

            {/* Waveform bars */}
            <rect x="130" y="50" width="20" height="80" rx="10" fill="url(#grad)" />
            <rect x="170" y="60" width="20" height="60" rx="10" fill="url(#grad)" />
            <rect x="210" y="30" width="20" height="120" rx="10" fill="url(#grad)" />
            <rect x="250" y="45" width="20" height="90" rx="10" fill="url(#grad)" />
            <rect x="290" y="35" width="20" height="110" rx="10" fill="url(#grad)" />

            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a160ff" />
                <stop offset="100%" stopColor="#ff985c" />
              </linearGradient>
            </defs>
          </svg>
        </div>
    )
}
