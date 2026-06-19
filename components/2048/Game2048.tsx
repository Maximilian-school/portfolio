"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Tile, Direction } from "./types";
import { CELL, GAP, getColor } from "./constants";
import { moveTiles, spawnTile } from "./engine";

export default function Game2048() {
  const [tiles, setTiles] = useState<Tile[]>(() => {
    const first = spawnTile([]);
    const second = spawnTile([first!]);
    return [first!, second!];
  });

  const [score, setScore] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const move = useCallback((dir: Direction) => {
    setTiles((prev) => {
      const result = moveTiles(prev, dir);

      const spawned = spawnTile(result.tiles);

      if (spawned) result.tiles.push(spawned);

      setScore((s) => s + result.scoreGain);

      return result.tiles;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") move("left");
      if (e.key === "ArrowRight") move("right");
      if (e.key === "ArrowUp") move("up");
      if (e.key === "ArrowDown") move("down");
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  return (
    <div>
      <div className="mb-4 flex gap-4">
        <div className="rounded bg-neutral-800 px-4 py-2">
          Score: {score}
        </div>
      </div>

      <div
        className="relative rounded-2xl bg-[#bbada0] p-3"
        style={{
          width: CELL * 4 + GAP * 3 + 24,
          height: CELL * 4 + GAP * 3 + 24,
        }}
        onTouchStart={(e) => {
          touch.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          };
        }}
        onTouchEnd={(e) => {
          if (!touch.current) return;

          const dx =
            e.changedTouches[0].clientX - touch.current.x;
          const dy =
            e.changedTouches[0].clientY - touch.current.y;

          if (Math.abs(dx) > Math.abs(dy)) {
            move(dx > 0 ? "right" : "left");
          } else {
            move(dy > 0 ? "down" : "up");
          }
        }}
      >
        {tiles.map((t) => (
          <motion.div
            key={t.id}
            animate={{
              x: t.col * (CELL + GAP),
              y: t.row * (CELL + GAP),
              scale: t.merged ? 1.15 : 1,
              backgroundColor: getColor(t.value),
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 35,
            }}
            className="absolute flex items-center justify-center rounded-xl font-bold shadow-md"
            style={{
              width: CELL,
              height: CELL,
              color: t.value <= 4 ? "#776e65" : "white",
              fontSize: t.value >= 1024 ? 28 : 34,
            }}
          >
            {t.value}
          </motion.div>
        ))}
      </div>
    </div>
  );
}