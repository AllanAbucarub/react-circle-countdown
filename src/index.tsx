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
let oldSeconds: number = 0;

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
    const [duration, setDuration] = useState(seconds > 0 ? seconds : 1);

    const mask =  useMemo(() => {
      setDuration(seconds > 0 ? seconds : 1);
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

    const convertedSeconds = useMemo(() => duration * SECOND, [duration]);
    const radius = useMemo(() => size / 2 - barWidth / 2, [size, barWidth]);
    const circumference = useMemo(() => radius * 2 * Math.PI, [radius]);

    const [countDown, setCountDown] = useState(convertedSeconds / MILISECOND);
    const [togglePause, setTogglePause] = useState(isPaused);

    useEffect(() => {
      if (oldSeconds > 0) {
        const secDifference = (duration - oldSeconds) * SECOND / MILISECOND;
        setCountDown(prev => {
          const value = prev + secDifference;
          return value > 0 ? value : 0; 
        });
        setToggleRestart((prev) => !prev);
      }

      oldSeconds = duration;
    }, [duration]);

    const [display, setDisplay] = useState( showMask ? secondsToTime(duration, mask) : duration );
  
    const [toggleRestart, setToggleRestart] = useState(false);
    const [sizeT, setSizeT] = useState(size);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
      setSizeT(size);
    }, [size]);

    useEffect(() => {
      const timeLeft = countDown * MILISECOND;

      if (timeLeft > 0 || isPaused) {
        setTogglePause(isPaused);
      }       
    }, [isPaused, countDown])

    useEffect(() => {
      if (!togglePause) {
        interval = window.setInterval(() => {
          setCountDown((prev) => {
            let value = prev - 1;     
            if (value <= 0) {
              value = 0;
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
    }, [togglePause, toggleRestart, onComplete]);

    useEffect(() => {
      const timeLeft = countDown * MILISECOND;
      const percentRest = (timeLeft * 100) / convertedSeconds;
      const newOffset = circumference - (percentRest / 100) * circumference;
      const paused = isPaused && (timeLeft < convertedSeconds && timeLeft > 0) ? pausedText : undefined;

      setOffset(newOffset);
      setDisplay(formatDisplay(timeLeft / SECOND, endText, paused, mask));
    }, [
      countDown,
      circumference,
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