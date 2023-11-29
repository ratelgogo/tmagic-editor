import cls from "classnames";
import Gesto from "gesto";
import "./index.less";
import { useCallback, useEffect, useMemo, useRef } from "react";

const ScrollBar: React.FC<{
  size?: number;
  scrollSize?: number;
  isHorizontal?: boolean;
  pos?: number;
  onScroll: (delta: number) => void;
}> = ({ size, isHorizontal = false, pos, onScroll, scrollSize }) => {
  const thumb = useRef<HTMLDivElement>();

  const bar = useRef<HTMLDivElement>();
  const thumbSize = useMemo(() => size * (size / scrollSize), [size, scrollSize]);
  const thumbPos = useMemo(() => (pos / scrollSize) * size, [pos, scrollSize, size]);

  const getDelta = useCallback(
    (e: any) => {
      const ratio = (isHorizontal ? e.deltaX : e.deltaY) / size;
      return scrollSize * ratio;
    },
    [isHorizontal, size],
  );
  const scrollBy = useCallback(
    (delta: number) => {
      if (delta < 0) {
        if (pos <= 0) {
          onScroll(0);
        } else {
          onScroll(-Math.min(-delta, pos));
        }
      } else {
        const leftPos = size - (thumbSize + thumbPos);
        if (leftPos <= 0) {
          onScroll(0);
        } else {
          onScroll(Math.min(delta, leftPos));
        }
      }
    },
    [onScroll, size, thumbSize, thumbPos, pos],
  );
  useEffect(() => {
    if (thumb.current) {
      const ges = new Gesto(thumb.current, {
        container: window,
      });

      ges
        .on("dragStart", (e) => {
          e.inputEvent.stopPropagation();
          e.inputEvent.prevenDefault();
        })
        .on("drag", (e) => {
          scrollBy(getDelta(e));
        });
      return () => {
        ges.off();
      };
    }
  }, [thumb.current, onScroll, getDelta]);

  const wheelHandler = useCallback(
    (e: WheelEvent) => {
      const delta = isHorizontal ? e.deltaX : e.deltaY;
      if (delta) {
        e.preventDefault();
      }
      scrollBy(delta);
    },
    [scrollBy, isHorizontal],
  );
  useEffect(() => {
    if (bar.current) {
      bar.current.addEventListener("wheel", wheelHandler, false);
    }
    return () => {
      bar.current.removeEventListener("wheel", wheelHandler, false);
    };
  }, [bar.current, wheelHandler]);
  return (
    <div
      ref={bar}
      className={cls({
        "m-editor-scroll-bar": true,
        horizontal: isHorizontal,
        vertical: !isHorizontal,
      })}
    >
      <div ref={thumb} className="m-editor-scroll-bar-thumb" />
    </div>
  );
};

export default ScrollBar;
