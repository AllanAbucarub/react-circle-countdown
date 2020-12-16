import React, {
  useEffect,
  useState,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import "./styles.scss";

const SECOND = 1000;
const MILISECOND = 100;
const FONT = "20px sans-serif";

export interface IInputHandles {
  restart(): void;
}

interface IProps {
  seconds: number;
  size?: number;
  font?: string;
  fontColor?: string;
  barColor?: string; 
  barWidth?: number; 
  barTrailColor?: string;
  barEndShape?: "round" | "butt";
  showMask?: boolean;
  isPaused?: boolean;
  pausedText?: string;
  endText?: string;
  onComplete?: () => any;
}

let interval: number;

const CountDown = forwardRef<IInputHandles, IProps>(
  (
    {
      seconds,
      size = 130,
      font = FONT,
      fontColor = "#FFF",
      barColor = "#8ac4e1", 
      barWidth = 15,
      barTrailColor= "#6e818b",
      barEndShape = "butt",
      showMask = true,
      isPaused = false,
      pausedText,
      endText = "Time over",
      onComplete,
    },
    ref
  ) => {
    const convertedSeconds = useMemo(() => seconds * SECOND, [seconds]);
    const radius = useMemo(() => size / 2 - barWidth / 2, [size, barWidth]);
    const circumference = useMemo(() => radius * 2 * Math.PI, [radius]);
    const mask =  useMemo(() => {
      if (!showMask) {
        return null;
      } else if (seconds > 3599) {
        return [11, 8];
      } else if (seconds > 59) {
        return [14, 5];
      } else {
        return [17, 2];
      } 
    }, [seconds, showMask]);

    const [countDown, setCountDown] = useState(convertedSeconds / MILISECOND);
    const [display, setDisplay] = useState( showMask ? secondsToTime(seconds, mask) : seconds );
    const [toggleRestart, setToggleRestart] = useState(false);
    const [sizeT, setSizeT] = useState(size);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
      setSizeT(size);
    }, [size]);

    useEffect(() => {
      if (!isPaused) {
        interval = window.setInterval(() => {
          setCountDown((prev) => {
            const value = prev - 1;            
            if (value === 0) {
              clearInterval(interval);
              onComplete && onComplete();
            }
            return value;
          });
        }, MILISECOND);
      }

      return () => {
        clearInterval(interval);
      };
    }, [isPaused, toggleRestart, onComplete]);

    useEffect(() => {
      const intervalRest = countDown * MILISECOND;
      const percentRest = (intervalRest * 100) / convertedSeconds;
      const newOffset = circumference - (percentRest / 100) * circumference;
      const paused = isPaused ? pausedText : undefined;

      setOffset(newOffset);
      setDisplay(formatDisplay(intervalRest / SECOND, endText, paused, mask));
    }, [
      countDown,
      circumference,
      seconds,
      convertedSeconds,
      endText,
      pausedText,
      isPaused,
      mask
    ]);

    useImperativeHandle(ref, () => ({
      restart() {
        setCountDown(convertedSeconds / MILISECOND);
        setToggleRestart((prev) => !prev);
      },
    }));

    return (
      <div className="count-down-container" style={{width:sizeT, height:sizeT}}>
        <svg>
          <circle
            className="teste"
            stroke={barTrailColor}
            strokeWidth={barWidth - 0.3}
            fill="transparent"
            r={radius}
            cx={sizeT / 2}
            cy={sizeT / 2}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset="0"            
          />
          <circle
            className="teste"
            stroke={barColor}
            strokeWidth={barWidth}
            fill="transparent"
            r={radius}
            cx={sizeT / 2}
            cy={sizeT / 2}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap={barEndShape}
          />
        </svg>
        <span style={{ color: fontColor, font: font, width: `calc(100% - ${barWidth*2.3}px)` }}>{display}</span>
      </div>
    );
  }
);

function secondsToTime(seconds: number, mask: number[] | null) {
  if (!mask) {
    return seconds;
  }
  var date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(mask[0], mask[1]);
}

function formatDisplay(
  seconds: number,
  text: string,
  pausedText: string | undefined,
  mask: number[] | null
) {
  const remaining = Math.ceil(seconds);
  if (pausedText) {
    return pausedText;
  } else {
    return remaining === 0 ? text : secondsToTime(remaining, mask);
  }
}

export default CountDown;
