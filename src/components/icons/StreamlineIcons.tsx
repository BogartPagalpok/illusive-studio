import React from 'react';

export interface StreamlineIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const ClapperboardDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <path fill="currentColor" fillOpacity={0.85} d="m2.79648 8.9322 -0.723 -0.723L23.2395 3.7537l-0.632 -3.002403L0.751282 5.353v17.8957H23.2487V8.9322H2.79648Z" strokeWidth="1"></path>
  <path fill={secondary} d="M0.751282 6.887V12H5.86428L0.751282 6.887Z" strokeWidth="1"></path>
  <path fill={secondary} d="M23.2487 12H0.751282v2.0452H23.2487V12Z" strokeWidth="1"></path>
  <path fill={secondary} d="m9.95477 20.1809 4.09043 -2.5565H9.95477v2.5565Z" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M2.79648 8.9322H23.2487v14.3165H0.751282V12" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M23.2487 12H0.751282" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M5.86438 12H0.751282V6.887L5.86438 12Z" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M0.751282 12H23.2487" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M8.4209 8.9322 11.4887 12" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M13.5339 8.9322 16.6017 12" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M18.647 8.9322 21.7148 12" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="m3.38452 7.9341 2.3704 -3.6344" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="m8.38818 6.8797 2.36932 -3.6333" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="m13.3918 5.8266 2.3694 -3.6344" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="m18.3944 4.7733 2.3704 -3.6344" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M2.07348 8.2092 23.2395 3.7537l-0.632 -3.002403L0.751282 5.353l0.408998 1.943 0.9132 0.9132Z" strokeWidth="1"></path>
  <path stroke={primary} strokeLinejoin="round" d="M9.95477 20.1809v-5.1131l4.09043 2.5566 -4.09043 2.5565Z" strokeWidth="1"></path>
      </svg>
    );
  }
);
ClapperboardDuotone.displayName = 'ClapperboardDuotone';

export const BrainDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="brain--medical-health-brain">
    <path id="Union" fill={secondary} d="M9.38017 1.43823c-1.31452 0 -2.38014 1.06563 -2.38014 2.38014l0.00006 6.47043c0 1.5044 1.2196 2.724 2.72405 2.724 1.50446 0 2.72406 -1.2196 2.72406 -2.724 0 -0.0771 -0.0032 -0.1534 -0.0095 -0.2289 0.5669 -0.60905 0.9246 -1.80039 0.9246 -2.79441 0 -1.35449 -0.6641 -2.67144 -1.6168 -3.18911 0.0091 -0.08475 0.0138 -0.17083 0.0138 -0.25801 0 -1.31451 -1.0656 -2.38014 -2.38013 -2.38014Z" strokeWidth="1"></path>
    <path id="Union_2" fill={secondary} d="M4.61959 1.43823c1.31451 0 2.38014 1.06563 2.38014 2.38014l-0.00006 6.47043c0 1.5044 -1.2196 2.724 -2.72405 2.724 -1.50446 0 -2.72406 -1.2196 -2.72406 -2.724 0 -0.0771 0.00321 -0.1534 0.00949 -0.2289C0.994116 9.45085 0.636414 8.25951 0.636414 7.26549c0 -1.35449 0.664156 -2.67144 1.616866 -3.18911 -0.00914 -0.08475 -0.01383 -0.17083 -0.01383 -0.25801 0 -1.31451 1.06563 -2.38014 2.38014 -2.38014Z" strokeWidth="1"></path>
    <path id="Union_3" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M4.61959 1.43823c1.31451 0 2.38014 1.06563 2.38014 2.38014l-0.00006 6.47043c0 1.5044 -1.2196 2.724 -2.72405 2.724 -1.50446 0 -2.72406 -1.2196 -2.72406 -2.724 0 -0.0771 0.00321 -0.1534 0.00949 -0.2289C0.994116 9.45085 0.636414 8.25951 0.636414 7.26549c0 -1.35449 0.664156 -2.67144 1.616866 -3.18911 -0.00914 -0.08475 -0.01383 -0.17083 -0.01383 -0.25801 0 -1.31451 1.06563 -2.38014 2.38014 -2.38014Z" strokeWidth="1"></path>
    <path id="Vector 605" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M3.51103 5.69409c-0.34948 -0.07968 -1.14142 -0.59904 -1.26091 -1.61157" strokeWidth="1"></path>
    <path id="Vector 610" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M4.97003 8.36479c1.42751 -0.15933 1.9932 -1.66583 2.02998 -2.27861" strokeWidth="1"></path>
    <path id="Vector 606" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M2.28949 8.63196c-0.35556 0.28074 -0.63905 0.91698 -0.7309 1.42664" strokeWidth="1"></path>
    <path id="Union_4" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M9.38017 1.43823c-1.31452 0 -2.38014 1.06563 -2.38014 2.38014l0.00006 6.47043c0 1.5044 1.2196 2.724 2.72405 2.724 1.50446 0 2.72406 -1.2196 2.72406 -2.724 0 -0.0771 -0.0032 -0.1534 -0.0095 -0.2289 0.5669 -0.60905 0.9246 -1.80039 0.9246 -2.79441 0 -1.35449 -0.6641 -2.67144 -1.6168 -3.18911 0.0091 -0.08475 0.0138 -0.17083 0.0138 -0.25801 0 -1.31451 -1.0656 -2.38014 -2.38013 -2.38014Z" strokeWidth="1"></path>
    <path id="Vector 611" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M10.4887 5.69409c0.3495 -0.07968 1.1414 -0.59904 1.2609 -1.61157" strokeWidth="1"></path>
    <path id="Vector 612" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M9.02972 8.36479c-1.4275 -0.15933 -1.9932 -1.66583 -2.02998 -2.27861" strokeWidth="1"></path>
    <path id="Vector 613" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M11.7103 8.63196c0.3555 0.28074 0.639 0.91698 0.7309 1.42664" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
BrainDuotone.displayName = 'BrainDuotone';

export const PaletteDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="paint-palette--color-colors-design-paint-painting-palette">
    <path id="Subtract" fill={secondary} fillRule="evenodd" d="M9.32603 11.7432c0.11543 0.1563 0.18284 0.3428 0.19399 0.5368 0.02719 0.2142 -0.02349 0.4309 -0.14281 0.6108s-0.29933 0.311 -0.50719 0.3692c-0.56595 0.1609 -1.15164 0.2416 -1.74 0.24 -1.19139 -0.0005 -2.35971 -0.3285 -3.37732 -0.9481 -1.01762 -0.6195 -1.84538 -1.5069 -2.39284 -2.565C0.812389 8.92875 0.566273 7.74049 0.648398 6.55194c0.082126 -1.18855 0.489332 -2.33167 1.177132 -3.30446 0.6878 -0.9728 1.62973 -1.73784 2.72289 -2.21156C5.64158 0.562205 6.8439 0.398044 8.02404 0.561374c1.18013 0.16333 2.29266 0.647866 3.21606 1.400676 0.9234 0.7528 1.6222 1.74492 2.0199 2.86795 0.1075 0.3022 0.1407 0.62581 0.0968 0.94353 -0.0439 0.31771 -0.1635 0.62022 -0.3488 0.88201 -0.1853 0.26178 -0.4309 0.47516 -0.7159 0.62213 -0.2851 0.14697 -0.6014 0.22323 -0.9221 0.22233H9.50002c-0.4761 -0.00131 -0.93705 0.16726 -1.29998 0.4754 -0.36293 0.30814 -0.60403 0.73565 -0.67995 1.20565 -0.07593 0.47001 0.01831 0.95165 0.26575 1.35845 0.24745 0.4067 0.63188 0.7118 1.08418 0.8605 0.18212 0.0677 0.34058 0.187 0.45601 0.3432ZM8.50002 5c0.55228 0 1 -0.44772 1 -1s-0.44772 -1 -1 -1c-0.55229 0 -1 0.44772 -1 1s0.44771 1 1 1Zm-4 1.5c0.55228 0 1 -0.44772 1 -1s-0.44772 -1 -1 -1c-0.55229 0 -1 0.44772 -1 1s0.44771 1 1 1Z" clipRule="evenodd" strokeWidth="1"></path>
    <path id="Vector" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M9.52002 12.28c-0.01115 -0.194 -0.07856 -0.3805 -0.19399 -0.5368 -0.11543 -0.1562 -0.27389 -0.2755 -0.45601 -0.3432 -0.4523 -0.1487 -0.83673 -0.4538 -1.08418 -0.8605 -0.24744 -0.4068 -0.34168 -0.88844 -0.26575 -1.35845 0.07592 -0.47 0.31702 -0.89751 0.67995 -1.20565 0.36293 -0.30814 0.82388 -0.47671 1.29998 -0.4754H11.37c0.3207 0.0009 0.637 -0.07536 0.9221 -0.22233 0.285 -0.14697 0.5306 -0.36035 0.7159 -0.62213 0.1853 -0.26179 0.3049 -0.5643 0.3488 -0.88201 0.0439 -0.31772 0.0107 -0.64133 -0.0968 -0.94353 -0.3977 -1.12303 -1.0965 -2.11515 -2.0199 -2.86795C10.3167 1.20924 9.20417 0.724704 8.02404 0.561374 6.8439 0.398044 5.64158 0.562205 4.54842 1.03592c-1.09316 0.47372 -2.03509 1.23876 -2.72289 2.21156 -0.6878 0.97279 -1.095006 2.11591 -1.177132 3.30446 -0.082125 1.18855 0.163991 2.37681 0.711462 3.43496 0.54746 1.0581 1.37522 1.9455 2.39284 2.565 1.01761 0.6196 2.18593 0.9476 3.37732 0.9481 0.58836 0.0016 1.17405 -0.0791 1.74 -0.24 0.20786 -0.0582 0.38787 -0.1893 0.50719 -0.3692 0.11932 -0.1799 0.17 -0.3966 0.14281 -0.6108v0Z" strokeWidth="1"></path>
    <path id="Vector_2" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M4.5 10c0.27614 0 0.5 -0.22386 0.5 -0.5S4.77614 9 4.5 9s-0.5 0.22386 -0.5 0.5 0.22386 0.5 0.5 0.5Z" strokeWidth="1"></path>
    <path id="Vector_3" fill="currentColor" fillOpacity={0.85} d="M8.5 5c0.55228 0 1 -0.44772 1 -1s-0.44772 -1 -1 -1 -1 0.44772 -1 1 0.44772 1 1 1Z" strokeWidth="1"></path>
    <path id="Vector_4" fill="currentColor" fillOpacity={0.85} d="M4.5 6.5c0.55228 0 1 -0.44772 1 -1s-0.44772 -1 -1 -1 -1 0.44772 -1 1 0.44772 1 1 1Z" strokeWidth="1"></path>
    <path id="Vector_5" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M8.5 5c0.55228 0 1 -0.44772 1 -1s-0.44772 -1 -1 -1 -1 0.44772 -1 1 0.44772 1 1 1Z" strokeWidth="1"></path>
    <path id="Vector_6" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M4.5 6.5c0.55228 0 1 -0.44772 1 -1s-0.44772 -1 -1 -1 -1 0.44772 -1 1 0.44772 1 1 1Z" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
PaletteDuotone.displayName = 'PaletteDuotone';

export const LayersDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="layers-1--design-layer-layers-pile-stack-align">
    <path id="Intersect" fill={secondary} d="M1.23331 3.08692c-0.643995 0.38588 -0.643791 0.94223 -0.00312 1.32937 0.63033 0.3809 1.28761 0.77015 2.0381 1.1302 0.75049 0.36004 1.56186 0.67536 2.35582 0.97776 0.80698 0.30736 1.96665 0.30746 2.77099 -0.00149 0.78702 -0.3023 1.59001 -0.61807 2.3366 -0.97626 0.7467 -0.35819 1.4049 -0.74342 2.035 -1.12099 0.644 -0.38588 0.6438 -0.94222 0.0031 -1.32937 -0.6303 -0.3809 -1.2876 -0.77015 -2.0381 -1.13019 -0.75048 -0.36004 -1.56185 -0.67537 -2.35581 -0.977767C7.5689 0.680823 6.40924 0.680725 5.6049 0.989677c-0.78702 0.302293 -1.59001 0.618063 -2.33664 0.976253 -0.74664 0.3582 -1.40483 0.74342 -2.03495 1.12099Z" strokeWidth="1"></path>
    <path id="Intersect_2" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M1.23331 3.08692c-0.643995 0.38588 -0.643791 0.94223 -0.00312 1.32937 0.63033 0.3809 1.28761 0.77015 2.0381 1.1302 0.75049 0.36004 1.56186 0.67536 2.35582 0.97776 0.80698 0.30736 1.96665 0.30746 2.77099 -0.00149 0.78702 -0.3023 1.59001 -0.61807 2.3366 -0.97626 0.7467 -0.35819 1.4049 -0.74342 2.035 -1.12099 0.644 -0.38588 0.6438 -0.94222 0.0031 -1.32937 -0.6303 -0.3809 -1.2876 -0.77015 -2.0381 -1.13019 -0.75048 -0.36004 -1.56185 -0.67537 -2.35581 -0.977767C7.5689 0.680823 6.40924 0.680725 5.6049 0.989677c-0.78702 0.302293 -1.59001 0.618063 -2.33664 0.976253 -0.74664 0.3582 -1.40483 0.74342 -2.03495 1.12099Z" strokeWidth="1"></path>
    <path id="Intersect_3" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M13.2501 7.79474c-0.6829 0.37757 -1.3962 0.7628 -2.2054 1.12099 -0.8092 0.35819 -1.67947 0.67396 -2.53243 0.97626 -0.87173 0.30891 -2.12856 0.30881 -3.00316 0.00149 -0.86047 -0.3024 -1.73982 -0.61772 -2.55319 -0.97777 -0.81336 -0.36004 -1.52571 -0.74929 -2.20885 -1.13019" strokeWidth="1"></path>
    <path id="Intersect_4" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M13.2501 10.9197c-0.6829 0.3776 -1.3962 0.7628 -2.2054 1.121 -0.8092 0.3582 -1.67947 0.674 -2.53243 0.9763 -0.87173 0.3089 -2.12856 0.3088 -3.00316 0.0015 -0.86047 -0.3024 -1.73982 -0.6177 -2.55319 -0.9778 -0.81336 -0.36 -1.52571 -0.7493 -2.20885 -1.1302" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
LayersDuotone.displayName = 'LayersDuotone';

export const AudioWaveformDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    void secondary;

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="music-equalizer--music-audio-note-wave-sound-equalizer-entertainment">
    <path id="Vector" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M1 5.616v2.768" strokeWidth="1"></path>
    <path id="Vector_2" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M4 3.31v7.381" strokeWidth="1"></path>
    <path id="Vector_3" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M7 1.002v11.996" strokeWidth="1"></path>
    <path id="Vector_4" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M10 3.31v7.381" strokeWidth="1"></path>
    <path id="Vector_5" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M13 5.616v2.768" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
AudioWaveformDuotone.displayName = 'AudioWaveformDuotone';

export const ImageDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <path fill={secondary} d="M23.9989 47.9978c13.2548 0 23.9999 -10.7451 23.9999 -23.9999S37.2537 -0.00195312 23.9989 -0.00195312 -0.000976562 10.7431 -0.000976562 23.9979c0 13.2548 10.745076562 23.9999 23.999876562 23.9999Z" strokeWidth="1"></path>
  <path fill={primary} d="M13.5264 11.7093c0 -0.9255 0.7501 -1.6756 1.6756 -1.6756h12.2879l6.9818 5.8647v20.3868c0 0.9255 -0.7501 1.6756 -1.6756 1.6756H15.202c-0.9255 0 -1.6756 -0.7501 -1.6756 -1.6756V11.7093Z" strokeWidth="1"></path>
  <path fill={secondary} d="M27.4902 10.0337v4.1891c0 0.9255 0.7501 1.6756 1.6757 1.6756h5.3061" strokeWidth="1"></path>
  <path fill={secondary} d="M31.8535 19.1978h-15.709v15.709h15.709v-15.709Z" strokeWidth="1"></path>
  <path fill={primary} d="M19.3779 34.024h11.552l-5.776 -10.7818 -5.776 10.7818Z" strokeWidth="1"></path>
  <path fill={primary} d="m26.5979 25.9376 -0.722 1.3478 -0.7219 -1.3478 -0.722 1.3478 -0.722 -1.3478 1.444 -2.6954 1.4439 2.6954Z" strokeWidth="1"></path>
  <path fill={primary} d="M19.6351 24.8698c0.964 0 1.7454 -0.7815 1.7454 -1.7454 0 -0.964 -0.7814 -1.7455 -1.7454 -1.7455 -0.964 0 -1.7455 0.7815 -1.7455 1.7455 0 0.9639 0.7815 1.7454 1.7455 1.7454Z" strokeWidth="1"></path>
  <path fill={primary} d="M17.0674 34.0243h7.7013l-3.8507 -6.161 -3.8506 6.161Z" strokeWidth="1"></path>
  <path fill={primary} d="m20.9187 30.5587 0.8425 -1.3477 -0.8425 -1.3477 -0.8425 1.3477 0.8425 1.3477Z" strokeWidth="1"></path>
      </svg>
    );
  }
);
ImageDuotone.displayName = 'ImageDuotone';

export const FilmDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="film--photos-camera-shutter-picture-photography-pictures-photo-lens-film-cut">
    <path id="Vector 373" fill="currentColor" fillOpacity={0.85} d="M3.52489 5.00035c0.05554 -1.17036 0.19466 -2.31428 0.32127 -3.04741 0.07325 -0.42415 0.44417 -0.70294 0.8746 -0.70294h4.55848c0.43043 0 0.80136 0.27879 0.87456 0.70294 0.1266 0.73313 0.2658 1.87705 0.3213 3.04741C10.5013 5.55202 10.0523 6 9.5 6h-5c-0.55228 0 -1.00128 -0.44798 -0.97511 -0.99965Z" strokeWidth="1"></path>
    <path id="Vector 372" fill="currentColor" fillOpacity={0.85} d="M3.52489 9.49965c0.05554 1.17035 0.19466 2.31425 0.32127 3.04745 0.07325 0.4241 0.44417 0.7029 0.8746 0.7029h4.55848c0.43043 0 0.80136 -0.2788 0.87456 -0.7029 0.1266 -0.7332 0.2658 -1.8771 0.3213 -3.04745C10.5013 8.94798 10.0523 8.5 9.5 8.5h-5c-0.55228 0 -1.00128 0.44798 -0.97511 0.99965Z" strokeWidth="1"></path>
    <path id="Subtract" fill={secondary} fillRule="evenodd" d="M0.75 7c0 -3.2 0.33333 -5.41667 0.5 -6.25h11.5c0.1667 0.83333 0.5 3.05 0.5 6.25s-0.3333 5.4167 -0.5 6.25H9.27924c0.43043 0 0.80136 -0.2788 0.87456 -0.7029 0.1266 -0.7332 0.2658 -1.8771 0.3213 -3.04745C10.5013 8.94798 10.0523 8.5 9.5 8.5h-5c-0.55228 0 -1.00128 0.44798 -0.97511 0.99965 0.05554 1.17035 0.19466 2.31425 0.32127 3.04745 0.07325 0.4241 0.44417 0.7029 0.8746 0.7029H1.25C1.08333 12.4167 0.75 10.2 0.75 7Zm3.09616 -5.04706c-0.12661 0.73313 -0.26573 1.87705 -0.32127 3.04741C3.49872 5.55202 3.94772 6 4.5 6h5c0.5523 0 1.0013 -0.44798 0.9751 -0.99965 -0.0555 -1.17036 -0.1947 -2.31428 -0.3213 -3.04741 -0.0732 -0.42415 -0.44413 -0.70294 -0.87456 -0.70294H4.72076c-0.43043 0 -0.80135 0.27879 -0.8746 0.70294Z" clipRule="evenodd" strokeWidth="1"></path>
    <path id="Vector 367" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M1.25 0.75C1.08333 1.58333 0.75 3.8 0.75 7s0.33333 5.4167 0.5 6.25" strokeWidth="1"></path>
    <path id="Vector 368" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M12.75 0.75c0.1667 0.83333 0.5 3.05 0.5 6.25s-0.3333 5.4167 -0.5 6.25" strokeWidth="1"></path>
    <path id="Vector 369" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M3.52489 9.49965c0.05554 1.17035 0.19466 2.31425 0.32127 3.04745 0.07325 0.4241 0.44417 0.7029 0.8746 0.7029h4.55848c0.43043 0 0.80136 -0.2788 0.87456 -0.7029 0.1266 -0.7332 0.2658 -1.8771 0.3213 -3.04745C10.5013 8.94798 10.0523 8.5 9.5 8.5h-5c-0.55228 0 -1.00128 0.44798 -0.97511 0.99965Z" strokeWidth="1"></path>
    <path id="Vector 371" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M3.52489 5.00035c0.05554 -1.17036 0.19466 -2.31428 0.32127 -3.04741 0.07325 -0.42415 0.44417 -0.70294 0.8746 -0.70294h4.55848c0.43043 0 0.80136 0.27879 0.87456 0.70294 0.1266 0.73313 0.2658 1.87705 0.3213 3.04741C10.5013 5.55202 10.0523 6 9.5 6h-5c-0.55228 0 -1.00128 -0.44798 -0.97511 -0.99965Z" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
FilmDuotone.displayName = 'FilmDuotone';

export const ZapDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="flash-1--flash-power-connect-charge-electricity-lightning">
    <path id="Vector" fill={secondary} d="m4.24997 0.5 -2.25 5.31c-0.03112 0.07575 -0.04316 0.15798 -0.03505 0.23947 0.0081 0.08149 0.03609 0.15975 0.08152 0.22789 0.04542 0.06813 0.10689 0.12407 0.179 0.16289 0.0721 0.03883 0.15264 0.05934 0.23453 0.05975h2.79l-2 7L11.84 5.36c0.0713 -0.06876 0.1206 -0.15716 0.1417 -0.254 0.021 -0.09683 0.0127 -0.19773 -0.0237 -0.28988 -0.0364 -0.09215 -0.0994 -0.17139 -0.181 -0.22768 -0.0815 -0.05628 -0.1779 -0.08707 -0.277 -0.08844H7.74997l2 -4h-5.5Z" strokeWidth="1"></path>
    <path id="Vector_2" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="m4.25003 0.5 -2.25 5.31c-0.03112 0.07575 -0.04315 0.15798 -0.03505 0.23947 0.0081 0.08149 0.03609 0.15975 0.08152 0.22789 0.04543 0.06813 0.10689 0.12407 0.179 0.16289 0.0721 0.03883 0.15264 0.05934 0.23453 0.05975h2.79l-2 7L11.84 5.36c0.0714 -0.06876 0.1207 -0.15716 0.1417 -0.254 0.021 -0.09683 0.0128 -0.19773 -0.0236 -0.28988 -0.0365 -0.09215 -0.0994 -0.17139 -0.181 -0.22768 -0.0815 -0.05628 -0.178 -0.08707 -0.2771 -0.08844H7.75003l2 -4h-5.5Z" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
ZapDuotone.displayName = 'ZapDuotone';

export const PlayDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <path fill="currentColor" fillOpacity={0.85} d="M4.84167 7.90959 12 3.81909l7.1583 4.0905v8.18081L12 20.1809l-7.15833 -4.0905V7.90959Z" strokeWidth="1"></path>
  <path fill={secondary} d="M16.6017 15.0677 12 17.6243l-4.60173 -2.5566 -2.5566 1.0227L12 20.1809l7.1583 -4.0905 -2.5566 -1.0227Z" strokeWidth="1"></path>
  <path fill={secondary} d="M9.95477 15.5791 16.0904 12H9.95477v3.5791Z" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M4.84167 7.90959 12 3.81909l7.1583 4.0905v8.18081L12 20.1809l-7.15833 -4.0905V7.90959Z" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M1.77393 10.9774v2.0452" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M22.2261 10.9774v2.0452" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="m7.80731 3.10327 -1.8407 0.9203" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="m3.10333 5.65979 -1.3294 0.7158v1.534" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="m16.1927 3.10327 1.8407 0.9203" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="m20.8967 5.65979 1.3294 0.7158v1.534" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M13.3294 1.46714 12 0.751343l-1.3294 0.715797" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="m7.80731 20.8968 -1.8407 -0.9204" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="m3.10333 18.3403 -1.3294 -0.7158v-1.534" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="m16.1927 20.8968 1.8407 -0.9204" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="m20.8967 18.3403 1.3294 -0.7159v-1.5339" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" d="M13.3294 22.533 12 23.2488l-1.3294 -0.7158" strokeWidth="1"></path>
  <path stroke={primary} strokeLinejoin="round" strokeMiterlimit="10" d="M9.95477 15.5791V8.4209L16.0904 12l-6.13563 3.5791Z" strokeWidth="1"></path>
      </svg>
    );
  }
);
PlayDuotone.displayName = 'PlayDuotone';

export const MonitorPlayDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g>
    <path d="M2 11.5v-10a1 1 0 0 1 1 -1h18a1 1 0 0 1 1 1v10Z" fill={secondary} strokeWidth="1"></path>
    <path d="M17.5 0.5H3a1 1 0 0 0 -1 1v10h4.5Z" fill={secondary} strokeWidth="1"></path>
    <path d="M2 11.5h20v2a1 1 0 0 1 -1 1H3a1 1 0 0 1 -1 -1Z" fill="currentColor" fillOpacity={0.85} strokeWidth="1"></path>
    <path d="m9.138 18.5 0.24 -0.386a7.233 7.233 0 0 0 1.191 -3.614h2.862a7.233 7.233 0 0 0 1.191 3.614l0.24 0.386Z" fill="currentColor" fillOpacity={0.85} stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
    <path d="m7.5 18.5 9 0" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
    <path d="m2 11.5 20 0" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
    <path d="M21 0.5a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1H3a1 1 0 0 1 -1 -1v-12a1 1 0 0 1 1 -1Z" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
    <path d="m12 20.5 0 3" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
    <path d="m4 23.5 16 0" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
MonitorPlayDuotone.displayName = 'MonitorPlayDuotone';

export const ArrowDownDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    void secondary;

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="arrow-down-2--down-move-arrow-arrows">
    <path id="Vector" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="m4 6.5 3 3 3 -3" strokeWidth="1"></path>
    <path id="Vector_2" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M7 0.5v9" strokeWidth="1"></path>
    <path id="Vector_3" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M3.5 13.5h7" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
ArrowDownDuotone.displayName = 'ArrowDownDuotone';

export const MenuDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <path d="M20.5 6.5a1 1 0 0 1 -1 1h-15a1 1 0 0 1 -1 -1v-1a1 1 0 0 1 1 -1h15a1 1 0 0 1 1 1Z" fill={secondary} strokeWidth="1"></path>
  <path d="M20.5 6v-0.5a1 1 0 0 0 -1 -1h-15a1 1 0 0 0 -1 1V6Z" fill={secondary} strokeWidth="1"></path>
  <path d="M20.5 12.5a1 1 0 0 1 -1 1h-15a1 1 0 0 1 -1 -1v-1a1 1 0 0 1 1 -1h15a1 1 0 0 1 1 1Z" fill={secondary} strokeWidth="1"></path>
  <path d="M20.5 12v-0.5a1 1 0 0 0 -1 -1h-15a1 1 0 0 0 -1 1v0.5Z" fill={secondary} strokeWidth="1"></path>
  <path d="M20.5 18.5a1 1 0 0 1 -1 1h-15a1 1 0 0 1 -1 -1v-1a1 1 0 0 1 1 -1h15a1 1 0 0 1 1 1Z" fill={secondary} strokeWidth="1"></path>
  <path d="M20.5 18v-0.5a1 1 0 0 0 -1 -1h-15a1 1 0 0 0 -1 1v0.5Z" fill={secondary} strokeWidth="1"></path>
  <path d="M20.5 6.5a1 1 0 0 1 -1 1h-15a1 1 0 0 1 -1 -1v-1a1 1 0 0 1 1 -1h15a1 1 0 0 1 1 1Z" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
  <path d="M20.5 12.5a1 1 0 0 1 -1 1h-15a1 1 0 0 1 -1 -1v-1a1 1 0 0 1 1 -1h15a1 1 0 0 1 1 1Z" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
  <path d="M20.5 18.5a1 1 0 0 1 -1 1h-15a1 1 0 0 1 -1 -1v-1a1 1 0 0 1 1 -1h15a1 1 0 0 1 1 1Z" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
      </svg>
    );
  }
);
MenuDuotone.displayName = 'MenuDuotone';

export const CloseDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    void secondary;

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="delete-1--remove-add-button-buttons-delete-cross-x-mathematics-multiply-math">
    <path id="Vector" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="m13.5 0.5 -13 13" strokeWidth="1"></path>
    <path id="Vector_2" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="m0.5 0.5 13 13" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
CloseDuotone.displayName = 'CloseDuotone';

export const SendDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="send-email--mail-send-email-paper-airplane">
    <path id="Vector" fill={secondary} d="m5.8077 11.0005 2.17799 2.168c0.13364 0.1369 0.30071 0.2366 0.4847 0.2892 0.18399 0.0526 0.37852 0.0562 0.56434 0.0105 0.18698 -0.0435 0.35963 -0.1343 0.50135 -0.2638 0.14173 -0.1295 0.24776 -0.2932 0.3079 -0.4755L13.4207 2.00876c0.0746 -0.20086 0.09 -0.41893 0.0444 -0.62829 -0.0457 -0.20937 -0.1505 -0.401209 -0.3021 -0.552731 -0.1515 -0.151523 -0.3433 -0.256351 -0.5527 -0.302025 -0.2093 -0.045674 -0.4274 -0.030273 -0.6283 0.044373L1.26189 4.14679c-0.18858 0.06441 -0.356533 0.17802 -0.486507 0.32907 -0.129974 0.15105 -0.217252 0.33407 -0.252815 0.53014 -0.036707 0.17833 -0.028535 0.36298 0.02378 0.53737 0.052316 0.17438 0.147138 0.33304 0.275944 0.46171L3.55977 8.74256l-0.08992 3.46684 2.33785 -1.2089Z" strokeWidth="1"></path>
    <path id="Vector_2" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="m5.8077 11.0005 2.17799 2.168c0.13364 0.1369 0.30071 0.2366 0.4847 0.2892 0.18399 0.0526 0.37852 0.0562 0.56434 0.0105 0.18698 -0.0435 0.35963 -0.1343 0.50135 -0.2638 0.14173 -0.1295 0.24776 -0.2932 0.3079 -0.4755L13.4207 2.00876c0.0746 -0.20086 0.09 -0.41893 0.0444 -0.62829 -0.0457 -0.20937 -0.1505 -0.401209 -0.3021 -0.552731 -0.1515 -0.151523 -0.3433 -0.256351 -0.5527 -0.302025 -0.2093 -0.045674 -0.4274 -0.030273 -0.6283 0.044373L1.26189 4.14679c-0.18858 0.06441 -0.356533 0.17802 -0.486507 0.32907 -0.129974 0.15105 -0.217252 0.33407 -0.252815 0.53014 -0.036707 0.17833 -0.028535 0.36298 0.02378 0.53737 0.052316 0.17438 0.147138 0.33304 0.275944 0.46171L3.55977 8.74256l-0.08992 3.46684 2.33785 -1.2089Z" strokeWidth="1"></path>
    <path id="Vector_3" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M13.101 0.789917 3.55975 8.74259" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
SendDuotone.displayName = 'SendDuotone';

export const MailDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <path d="M2 4.5h20s1.5 0 1.5 1.5v12s0 1.5 -1.5 1.5H2S0.5 19.5 0.5 18V6S0.5 4.5 2 4.5" fill={secondary} strokeWidth="1"></path>
  <path d="M2 4.5A1.5 1.5 0 0 0 0.5 6v12A1.5 1.5 0 0 0 2 19.5h0.5l15 -15Z" fill="currentColor" fillOpacity={0.85} strokeWidth="1"></path>
  <path d="M2 4.5h20s1.5 0 1.5 1.5v12s0 1.5 -1.5 1.5H2S0.5 19.5 0.5 18V6S0.5 4.5 2 4.5" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
  <path d="M16.5 7.5h4v4h-4Z" fill={secondary} strokeWidth="1"></path>
  <path d="M16.5 7.5h4v4h-4Z" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
  <path d="m4.5 8.5 2 0" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
  <path d="m4.5 13.497 9 0" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
  <path d="m4.5 16.5 12 0" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
      </svg>
    );
  }
);
MailDuotone.displayName = 'MailDuotone';

export const PhoneDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <path fill="currentColor" fillOpacity={0.85} d="M15.5791 13.0226h3.5792l4.0904 4.0904v6.1357h-7.1583L0.751343 7.9096V0.751301H6.88704L10.9774 4.8417v3.5792l4.6017 4.6017Z" strokeWidth="1"></path>
  <path fill={secondary} d="M0.751343 1.8466v6.063L16.0904 23.2487h6.0631L0.751343 1.8466Z" strokeWidth="1"></path>
  <path stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M15.5791 13.0226h3.5792l4.0904 4.0904v6.1357h-7.1583L0.751343 7.9096V0.751301H6.88704L10.9774 4.8417v3.5792l4.6017 4.6017Z" strokeWidth="1"></path>
      </svg>
    );
  }
);
PhoneDuotone.displayName = 'PhoneDuotone';

export const InstagramDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="instagram">
    <path id="Subtract" fill={secondary} fillRule="evenodd" d="M3.43129 0.858459C2.01025 0.858459 0.858276 2.01044 0.858276 3.43147v6.86133c0 1.4211 1.151974 2.5731 2.573014 2.5731h6.86141c1.421 0 2.573 -1.152 2.573 -2.5731V3.43147c0 -1.42103 -1.152 -2.573011 -2.573 -2.573011H3.43129ZM6.86208 9.41165c1.40809 0 2.54958 -1.14148 2.54958 -2.54957 0 -1.4081 -1.14149 -2.54958 -2.54958 -2.54958 -1.40809 0 -2.54957 1.14148 -2.54957 2.54958 0 1.40809 1.14148 2.54957 2.54957 2.54957Z" clipRule="evenodd" strokeWidth="1"></path>
    <path id="Ellipse 11" fill="currentColor" fillOpacity={0.85} d="M4.312 6.862a2.55 2.55 0 1 0 5.1 0 2.55 2.55 0 1 0 -5.1 0" strokeWidth="1"></path>
    <path id="Ellipse 12" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M4.312 6.862a2.55 2.55 0 1 0 5.1 0 2.55 2.55 0 1 0 -5.1 0" strokeWidth="1"></path>
    <path id="Rectangle 3" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M0.858276 3.43147c0 -1.42103 1.151974 -2.573011 2.573014 -2.573011h6.86141c1.421 0 2.573 1.151981 2.573 2.573011v6.86133c0 1.4211 -1.152 2.5731 -2.573 2.5731H3.43129c-1.42104 0 -2.573014 -1.152 -2.573014 -2.5731V3.43147Z" strokeWidth="1"></path>
    <g id="Group 4546">
      <path id="Vector" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M10.3332 3.64417c-0.1381 0 -0.25 -0.11193 -0.25 -0.25 0 -0.13808 0.1119 -0.25 0.25 -0.25" strokeWidth="1"></path>
      <path id="Vector_2" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M10.3332 3.64417c0.1381 0 0.25 -0.11193 0.25 -0.25 0 -0.13808 -0.1119 -0.25 -0.25 -0.25" strokeWidth="1"></path>
    </g>
  </g>
      </svg>
    );
  }
);
InstagramDuotone.displayName = 'InstagramDuotone';

export const FacebookDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="facebook-1--media-facebook-social">
    <path id="Rectangle 1097" fill={secondary} d="M3.539 39.743c0.208 2.555 2.163 4.51 4.718 4.718C11.485 44.723 16.636 45 24 45c7.364 0 12.515 -0.277 15.743 -0.539 2.555 -0.208 4.51 -2.163 4.718 -4.718C44.723 36.515 45 31.364 45 24c0 -7.364 -0.277 -12.515 -0.539 -15.743 -0.208 -2.555 -2.163 -4.51 -4.718 -4.718C36.515 3.277 31.364 3 24 3c-7.364 0 -12.515 0.277 -15.743 0.539 -2.555 0.208 -4.51 2.163 -4.718 4.718C3.277 11.485 3 16.636 3 24c0 7.364 0.277 12.515 0.539 15.743Z" strokeWidth="1"></path>
    <path id="Intersect" fill="currentColor" fillOpacity={0.85} d="M29.516 44.945V30.04h5.539c0.888 0 1.687 -0.584 1.817 -1.463a12.86 12.86 0 0 0 -0.015 -3.715c-0.128 -0.862 -0.896 -1.43 -1.768 -1.43h-5.573c0 -4.994 0.831 -5.72 5.515 -5.811 0.899 -0.017 1.705 -0.61 1.836 -1.5 0.22 -1.495 0.132 -2.802 -0.006 -3.72 -0.127 -0.85 -0.888 -1.403 -1.746 -1.395 -8.279 0.072 -12.994 1.051 -12.994 12.426h-4.288c-0.834 0 -1.574 0.522 -1.7 1.346 -0.136 0.888 -0.218 2.175 0.009 3.74 0.13 0.904 0.944 1.522 1.858 1.522h4.121v14.955a279.373 279.373 0 0 0 7.395 -0.05Z" strokeWidth="1"></path>
    <path id="Rectangle 1096" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M3.539 39.743c0.208 2.555 2.163 4.51 4.718 4.718C11.485 44.723 16.636 45 24 45c7.364 0 12.515 -0.277 15.743 -0.539 2.555 -0.208 4.51 -2.163 4.718 -4.718C44.723 36.515 45 31.364 45 24c0 -7.364 -0.277 -12.515 -0.539 -15.743 -0.208 -2.555 -2.163 -4.51 -4.718 -4.718C36.515 3.277 31.364 3 24 3c-7.364 0 -12.515 0.277 -15.743 0.539 -2.555 0.208 -4.51 2.163 -4.718 4.718C3.277 11.485 3 16.636 3 24c0 7.364 0.277 12.515 0.539 15.743Z" strokeWidth="1"></path>
    <path id="Intersect_2" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M29.516 44.944V30.04h5.539c0.888 0 1.687 -0.585 1.817 -1.463a12.858 12.858 0 0 0 -0.015 -3.715c-0.128 -0.862 -0.896 -1.43 -1.768 -1.43h-5.573c0 -4.994 0.831 -5.72 5.515 -5.811 0.899 -0.018 1.705 -0.61 1.836 -1.5 0.22 -1.495 0.132 -2.802 -0.006 -3.72 -0.127 -0.85 -0.888 -1.402 -1.746 -1.395 -8.279 0.072 -12.994 1.051 -12.994 12.426h-4.288c-0.834 0 -1.574 0.522 -1.7 1.346 -0.136 0.888 -0.218 2.175 0.009 3.74 0.13 0.904 0.944 1.522 1.858 1.522h4.121v14.955" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
FacebookDuotone.displayName = 'FacebookDuotone';

export const GithubDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <title>developer-community-github-1</title>
  <path d="M12 0.5a11.5 11.5 0 0 0 -3.635 22.414c0.574 0.1 0.756 -0.237 0.756 -0.541 0 -0.275 0.006 -1.037 0 -2 -3.2 0.694 -3.861 -1.515 -3.861 -1.515a3.043 3.043 0 0 0 -1.276 -1.682c-1.044 -0.714 0.078 -0.7 0.078 -0.7a2.414 2.414 0 0 1 1.762 1.184 2.448 2.448 0 0 0 3.346 0.956 2.45 2.45 0 0 1 0.73 -1.532c-2.553 -0.292 -5.238 -1.278 -5.238 -5.686a4.447 4.447 0 0 1 1.185 -3.086 4.126 4.126 0 0 1 0.112 -3.043s0.967 -0.309 3.162 1.18a10.883 10.883 0 0 1 5.76 0c2.2 -1.488 3.159 -1.18 3.159 -1.18a4.131 4.131 0 0 1 0.114 3.043 4.442 4.442 0 0 1 1.183 3.088c0 4.42 -2.689 5.391 -5.251 5.674a2.727 2.727 0 0 1 0.787 2.12v3.184c0 0.307 0.186 0.647 0.77 0.536A11.5 11.5 0 0 0 12 0.5" fill={secondary} strokeWidth="1"></path>
  <path d="M5.75 5.936a5.06 5.06 0 0 1 0.209 -0.667 1.881 1.881 0 0 1 0.855 0.058 11.422 11.422 0 0 1 10.373 0 1.866 1.866 0 0 1 0.853 -0.059 5.014 5.014 0 0 1 0.209 0.667 11.483 11.483 0 0 1 5.1 7.9 11.5 11.5 0 1 0 -22.706 0A11.485 11.485 0 0 1 5.75 5.936" fill={secondary} strokeWidth="1"></path>
  <path d="M12 0.5a11.5 11.5 0 0 0 -3.635 22.414c0.574 0.1 0.756 -0.237 0.756 -0.541 0 -0.275 0.006 -1.037 0 -2 -3.2 0.694 -3.861 -1.515 -3.861 -1.515a3.043 3.043 0 0 0 -1.276 -1.682c-1.044 -0.714 0.078 -0.7 0.078 -0.7a2.414 2.414 0 0 1 1.762 1.184 2.448 2.448 0 0 0 3.346 0.956 2.45 2.45 0 0 1 0.73 -1.532c-2.553 -0.292 -5.238 -1.278 -5.238 -5.686a4.447 4.447 0 0 1 1.185 -3.086 4.126 4.126 0 0 1 0.112 -3.043s0.967 -0.309 3.162 1.18a10.883 10.883 0 0 1 5.76 0c2.2 -1.488 3.159 -1.18 3.159 -1.18a4.131 4.131 0 0 1 0.114 3.043 4.442 4.442 0 0 1 1.183 3.088c0 4.42 -2.689 5.391 -5.251 5.674a2.727 2.727 0 0 1 0.787 2.12v3.184c0 0.307 0.186 0.647 0.77 0.536A11.5 11.5 0 0 0 12 0.5" fill="none" stroke={primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1"></path>
      </svg>
    );
  }
);
GithubDuotone.displayName = 'GithubDuotone';

export const SparklesDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="multiple-stars--reward-rating-rate-social-star-media-favorite-like-stars-spark">
    <path id="Star 13" fill={secondary} d="M12.873 20.369c-0.277 0.841 -1.469 0.841 -1.745 0l-1.71 -5.2a0.919 0.919 0 0 0 -0.586 -0.586l-5.2 -1.71c-0.843 -0.277 -0.843 -1.469 0 -1.745l5.2 -1.71a0.918 0.918 0 0 0 0.585 -0.586l1.71 -5.2c0.277 -0.843 1.469 -0.843 1.745 0l1.71 5.2a0.919 0.919 0 0 0 0.586 0.585l5.2 1.71c0.843 0.277 0.843 1.469 0 1.745l-5.2 1.71a0.919 0.919 0 0 0 -0.585 0.586l-1.71 5.2Z" strokeWidth="1"></path>
    <path id="Star 12" fill={secondary} d="M16.97 44.298c-0.308 0.936 -1.632 0.936 -1.94 0l-1.9 -5.778a1.02 1.02 0 0 0 -0.65 -0.65l-5.778 -1.9c-0.936 -0.308 -0.936 -1.632 0 -1.94l5.778 -1.9a1.02 1.02 0 0 0 0.65 -0.65l1.9 -5.778c0.308 -0.936 1.632 -0.936 1.94 0l1.9 5.778c0.101 0.308 0.342 0.549 0.65 0.65l5.778 1.9c0.936 0.308 0.936 1.632 0 1.94l-5.778 1.9a1.02 1.02 0 0 0 -0.65 0.65l-1.9 5.778Z" strokeWidth="1"></path>
    <path id="Star 11" fill={secondary} d="M33.18 32.146c-0.375 1.139 -1.985 1.139 -2.36 0l-2.518 -7.656a1.243 1.243 0 0 0 -0.792 -0.792l-7.656 -2.518c-1.139 -0.375 -1.139 -1.985 0 -2.36l7.656 -2.518a1.24 1.24 0 0 0 0.792 -0.792l2.518 -7.656c0.375 -1.139 1.985 -1.139 2.36 0l2.518 7.656c0.123 0.375 0.417 0.669 0.792 0.792l7.656 2.518c1.139 0.375 1.139 1.985 0 2.36l-7.656 2.518a1.243 1.243 0 0 0 -0.792 0.792l-2.518 7.656Z" strokeWidth="1"></path>
    <path id="Star 8" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M33.18 32.146c-0.375 1.139 -1.985 1.139 -2.36 0l-2.518 -7.656a1.243 1.243 0 0 0 -0.792 -0.792l-7.656 -2.518c-1.139 -0.375 -1.139 -1.985 0 -2.36l7.656 -2.518a1.24 1.24 0 0 0 0.792 -0.792l2.518 -7.656c0.375 -1.139 1.985 -1.139 2.36 0l2.518 7.656c0.123 0.375 0.417 0.669 0.792 0.792l7.656 2.518c1.139 0.375 1.139 1.985 0 2.36l-7.656 2.518a1.243 1.243 0 0 0 -0.792 0.792l-2.518 7.656Z" strokeWidth="1"></path>
    <path id="Star 9" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M16.97 44.298c-0.308 0.936 -1.632 0.936 -1.94 0l-1.9 -5.778a1.02 1.02 0 0 0 -0.65 -0.65l-5.778 -1.9c-0.936 -0.308 -0.936 -1.632 0 -1.94l5.778 -1.9a1.02 1.02 0 0 0 0.65 -0.65l1.9 -5.778c0.308 -0.936 1.632 -0.936 1.94 0l1.9 5.778c0.101 0.308 0.342 0.549 0.65 0.65l5.778 1.9c0.936 0.308 0.936 1.632 0 1.94l-5.778 1.9a1.02 1.02 0 0 0 -0.65 0.65l-1.9 5.778Z" strokeWidth="1"></path>
    <path id="Star 10" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M12.873 20.369c-0.277 0.841 -1.469 0.841 -1.745 0l-1.71 -5.2a0.919 0.919 0 0 0 -0.586 -0.586l-5.2 -1.71c-0.843 -0.277 -0.843 -1.469 0 -1.745l5.2 -1.71a0.918 0.918 0 0 0 0.585 -0.586l1.71 -5.2c0.277 -0.843 1.469 -0.843 1.745 0l1.71 5.2a0.919 0.919 0 0 0 0.586 0.585l5.2 1.71c0.843 0.277 0.843 1.469 0 1.745l-5.2 1.71a0.919 0.919 0 0 0 -0.585 0.586l-1.71 5.2Z" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
SparklesDuotone.displayName = 'SparklesDuotone';

export const ExternalLinkDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';
    void secondary;

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <g id="link-chain--create-hyperlink-link-make-unlink-connection-chain">
    <path id="Vector" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M8.858 5.143 5.143 8.857" strokeWidth="1"></path>
    <path id="Vector 2470" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M8.235 11.343c-2.353 2.073 -4.535 3.094 -6.603 1.025 -2.051 -2.05 -1.065 -4.212 0.972 -6.542" strokeWidth="1"></path>
    <path id="Vector 2471" stroke={primary} strokeLinecap="round" strokeLinejoin="round" d="M5.766 2.657C8.118 0.584 10.3 -0.437 12.369 1.632c2.05 2.05 1.064 4.212 -0.973 6.542" strokeWidth="1"></path>
  </g>
      </svg>
    );
  }
);
ExternalLinkDuotone.displayName = 'ExternalLinkDuotone';

export const XTwitterDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <path
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          fill={secondary}
        />
        <path
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          stroke={primary}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
);
XTwitterDuotone.displayName = 'XTwitterDuotone';

export const LinkedinDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <rect x="2" y="2" width="20" height="20" rx="4" fill={secondary} stroke={primary} strokeWidth="1" />
        <circle cx="7" cy="8" r="1.5" fill={primary} />
        <path d="M5.5 11h3v7h-3z" fill={primary} />
        <path d="M11.5 11h2.8v1.1c.5-.8 1.5-1.3 2.7-1.3 2.4 0 3.5 1.5 3.5 4v3.2h-3v-3c0-1.2-.4-1.8-1.4-1.8-1 0-1.6.7-1.6 1.8v3h-3V11z" fill={primary} />
      </svg>
    );
  }
);
LinkedinDuotone.displayName = 'LinkedinDuotone';

export const RedditDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <circle cx="12" cy="12" r="10" fill={secondary} stroke={primary} strokeWidth="1" />
        <path d="M14.5 7.5L16 4.5h2" stroke={primary} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18.5" cy="4.5" r="1" fill={primary} />
        <circle cx="6" cy="12" r="2" fill={secondary} stroke={primary} strokeWidth="1" />
        <circle cx="18" cy="12" r="2" fill={secondary} stroke={primary} strokeWidth="1" />
        <ellipse cx="12" cy="13" rx="5.5" ry="4" fill="currentColor" fillOpacity="0.1" stroke={primary} strokeWidth="1" />
        <circle cx="9.5" cy="12.5" r="1" fill={primary} />
        <circle cx="14.5" cy="12.5" r="1" fill={primary} />
        <path d="M10 15c.6.6 1.4.8 2 .8s1.4-.2 2-.8" stroke={primary} strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  }
);
RedditDuotone.displayName = 'RedditDuotone';

export const DiscordDuotone = React.forwardRef<SVGSVGElement, StreamlineIconProps>(
  ({ size = 24, primaryColor, secondaryColor, className = '', style, ...props }: StreamlineIconProps, ref: React.Ref<SVGSVGElement>) => {
    const primary = primaryColor || 'var(--accent, #FC931F)';
    const secondary = secondaryColor || 'rgba(var(--accent-rgb, 252, 147, 31), 0.28)';

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 ${className}`}
        style={style}
        {...props}
      >
        <path
          d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.1.1 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.08-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.01.02.05.03.07.02 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z"
          fill={secondary}
          stroke={primary}
          strokeWidth="0.5"
        />
        <circle cx="8.52" cy="12.79" r="1.2" fill={primary} />
        <circle cx="15.49" cy="12.79" r="1.2" fill={primary} />
      </svg>
    );
  }
);
DiscordDuotone.displayName = 'DiscordDuotone';


