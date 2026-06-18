import React from "react"
import Svg, {
  Circle,
  Path,
  Rect,
  Line,
  Polyline,
  type SvgProps,
} from "react-native-svg"

type IconProps = Omit<SvgProps, "width" | "height"> & {
  size?: number
}

function createIcon(children: React.ReactNode) {
  return ({ size = 24, ...props }: IconProps) => (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </Svg>
  )
}

export const IconSearch = createIcon(
  <>
    <Circle cx="11" cy="11" r="8" />
    <Path d="m21 21-4.35-4.35" />
  </>,
)

export const IconHome = createIcon(
  <>
    <Path d="M3 12a9 9 0 1 1 18 0" />
    <Path d="M3 12v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <Path d="M10 12h4v5h-4z" />
  </>,
)

export const IconUser = createIcon(
  <>
    <Circle cx="12" cy="8" r="4" />
    <Path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
  </>,
)

export const IconPlay = ({ size = 24, ...props }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path d="M8 5v14l11-7z" />
  </Svg>
)

export const IconPause = ({ size = 24, ...props }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Rect x="6" y="4" width="4" height="16" rx="1" />
    <Rect x="14" y="4" width="4" height="16" rx="1" />
  </Svg>
)

export const IconSkipPrev = ({ size = 24, ...props }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path d="M6 6v12M18 6l-9 6 9 6" />
  </Svg>
)

export const IconSkipNext = ({ size = 24, ...props }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path d="M6 6l9 6-9 6V6M18 6v12" />
  </Svg>
)

export const IconHeart = createIcon(
  <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
)

export const IconHeartFilled = ({ size = 24, ...props }: IconProps) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
)

export const IconMusic = createIcon(
  <>
    <Path d="M9 18V5l12-2v13" />
    <Circle cx="6" cy="18" r="3" />
    <Circle cx="18" cy="16" r="3" />
  </>,
)

export const IconClock = createIcon(
  <>
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </>,
)

export const IconList = createIcon(
  <>
    <Line x1="8" y1="6" x2="21" y2="6" />
    <Line x1="8" y1="12" x2="21" y2="12" />
    <Line x1="8" y1="18" x2="21" y2="18" />
    <Line x1="3" y1="6" x2="3.01" y2="6" />
    <Line x1="3" y1="12" x2="3.01" y2="12" />
    <Line x1="3" y1="18" x2="3.01" y2="18" />
  </>,
)

export const IconShuffle = createIcon(
  <>
    <Polyline points="16 3 21 3 21 8" />
    <Line x1="4" y1="20" x2="21" y2="3" />
    <Polyline points="21 16 21 21 16 21" />
    <Line x1="15" y1="15" x2="21" y2="21" />
    <Line x1="4" y1="4" x2="9" y2="9" />
  </>,
)

export const IconClose = createIcon(
  <>
    <Path d="M18 6 6 18M6 6l12 12" />
  </>,
)

export const IconSettings = createIcon(
  <>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </>,
)

export const IconArrowLeft = createIcon(<Path d="m15 18-6-6 6-6" />)

export const IconArrowRight = createIcon(<Path d="m9 18 6-6-6-6" />)