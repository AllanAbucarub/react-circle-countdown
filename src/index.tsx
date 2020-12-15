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
const FONT = "bold 16px sans-serif";

export interface IInputHandles {
  restart(): void;
}

interface IProps {
  seconds: number;
  size?: number;
  font?: string;
  fontColor?: string;
  bar?: { color: string; width: number; backGroundColor: string };
  showAllMask?: boolean;
  isPaused?: boolean;
  pausedText?: string;
  finishText?: string;
  onComplete?: () => any;
}

let interval: number;

const CountDown = forwardRef<IInputHandles, IProps>(
  (
    {
      seconds,
      size = 110,
      font = FONT,
      fontColor = "#FFF",
      bar = { color: "lime", width: 10, backGroundColor: "green" },
      showAllMask = false,
      isPaused = false,
      pausedText,
      finishText = "FINISH",
      onComplete,
    },
    ref
  ) => {
    const convertedSeconds = useMemo(() => seconds * SECOND, [seconds]);
    const radius = useMemo(() => size / 2 - bar.width, [size, bar.width]);
    const circumference = useMemo(() => radius * 2 * Math.PI, [radius]);
    const mask =  useMemo(() => {
      if (showAllMask || seconds > 3599) {
        return [11, 8];
      } else if (seconds > 59) {
        return [14, 5];
      } else {
        return [17, 2];
      } 
    }, [showAllMask, seconds]);

    const [countDown, setCountDown] = useState(convertedSeconds / MILISECOND);
    const [display, setDisplay] = useState(secondsToTime(seconds, mask));
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
      setDisplay(formatDisplay(intervalRest / SECOND, finishText, paused, mask));
    }, [
      countDown,
      circumference,
      seconds,
      convertedSeconds,
      finishText,
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
            stroke={bar.backGroundColor}
            strokeWidth={bar.width - 0.3}
            fill="transparent"
            r={radius}
            cx={sizeT / 2}
            cy={sizeT / 2}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset="0"            
          />
          <circle
            className="teste"
            stroke={bar.color}
            strokeWidth={bar.width}
            fill="transparent"
            r={radius}
            cx={sizeT / 2}
            cy={sizeT / 2}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span style={{ color: fontColor, font: font }}>{display}</span>
      </div>
    );
  }
);

function secondsToTime(seconds: number, mask: number[]) {
  var date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(mask[0], mask[1]);
}

function formatDisplay(
  seconds: number,
  text: string,
  pausedText: string | undefined,
  mask: number[]
) {
  if (pausedText) {
    return pausedText;
  } else {
    return seconds === 0 ? text : secondsToTime(seconds + 0.9, mask);
  }
}

export default CountDown;
