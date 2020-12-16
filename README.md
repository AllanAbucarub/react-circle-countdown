# React Circle Countdown
React Circle Countdown is a customizable animated countdown component.

## Installation

```
npm i @abucarub/react-circle-countdown
```

## Usage

```jsx
import CircleCountdown from '@abucarub/react-circle-countdown';

const YourComponent = () => (
      <CircleCountdown
        seconds={10}
        size={150}
        font="bold 20px Arial"
        fontColor="#D7ECE6"
        barColor="rgb(51, 255, 153, 0.5)"
        barWidth={15}
        barTrailColor="#64867B"
        barEndShape="round"
        isPaused={false}
        pausedText="Wait"
        endText="Finished"
        onComplete={() => {
          console.log('Do something');
        }}
      />
)
```

## Props
| Name         | Type       | Default    | Description               |
| ------------ | ---------- | ---------- | ------------------------- |
| seconds | Number | required | The seconds to count down ( min value: 1) |
| size | number | 130 | The width and height of the component |
| font | string | "20px sans-serif" | Just like the CSS 'font' property |
| fontColor | string | ![#fff](https://i.postimg.cc/6QRMDrW6/white-square.png) `'#fff'` | Takes any valid color format (HEX, rgb, rgba) |
| barColor | string | ![#8ac4e1](https://i.postimg.cc/wj1fkKnm/blue-square.png) `'#8ac4e1'` | Takes any valid color format (HEX, rgb, rgba) |
| barTrailColor | string | ![#6e818b](https://i.postimg.cc/g21MSSPB/gray-square.png) `'#6e818b'` | Takes any valid color format (HEX, rgb, rgba) |
| barWidth | number | 15 | Path bar width |
| barEndShape | round \| butt | butt | The shape of bar end |
| isPaused | boolean | true | Pause and play animation |
| pausedText | string | Current time | The displayed text when the animation is paused |
| endText | string | "Time over" | The displayed when the countdown is over |
| showMask | boolean | true | If set false, it show just a countdown without any mask |
| onComplete | function |  | Called when the countdown is over |

## Recipes
#### To restart de countdown
Could be restarted at any time, by using a useRef hook. 

```jsx
import React, { useRef } from 'react';
import CountDown, { IInputHandles } from "../components/CountDown";

const YourComponent = () => {
  const restartRef = useRef<IInputHandles>(null);

  const handleRestart = () => {
    restartRef.current?.restart();
  };

  return (
    <>
      <button onClick={() => handleRestart()}>
        Restart
      </button>
      <CircleCountDown
        ref={restartRef}
        seconds={80}      
      />
    </>
  )
}
...
```
