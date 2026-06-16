"use client";

import { useEffect, useState, useRef } from "react";

const SIZE = 4;
const TILE_SIZE = 48;
const GAP = 6;
const BOARD_SIZE = TILE_SIZE * SIZE + GAP * (SIZE - 1) + 12;
const ANIMATION_DURATION = 150;

type Board = number[][];
type AnimatingTile = {
  id: number;
  value: number;
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  startTime: number;
  isMerged?: boolean;
};

function createEmptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function getRandomEmpty(board: Board) {
  const empty: [number, number][] = [];

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) empty.push([r, c]);
    }
  }

  if (!empty.length) return null;

  return empty[Math.floor(Math.random() * empty.length)];
}

function addRandomTile(board: Board): Board {
  const pos = getRandomEmpty(board);

  if (!pos) return board;

  const [r, c] = pos;
  const clone = board.map((row) => [...row]);

  clone[r][c] = Math.random() < 0.9 ? 2 : 4;

  return clone;
}

function initializeBoard() {
  let board = createEmptyBoard();
  board = addRandomTile(board);
  board = addRandomTile(board);
  return board;
}

function slideRowLeft(row: number[]) {
  const filtered = row.filter((n) => n !== 0);

  let scoreGain = 0;
  const merged = [];

  for (let i = 0; i < filtered.length; i++) {
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      const newValue = filtered[i] * 2;
      merged.push(newValue);
      scoreGain += newValue;
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }

  while (merged.length < SIZE) {
    merged.push(0);
  }

  return {
    row: merged,
    scoreGain,
  };
}

function reverse(board: Board): Board {
  return board.map((row) => [...row].reverse());
}

function transpose(board: Board): Board {
  return board[0].map((_, c) => board.map((row) => row[c]));
}

function boardsEqual(a: Board, b: Board) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function moveLeft(board: Board) {
  let scoreGain = 0;

  const moved = board.map((row) => {
    const result = slideRowLeft(row);
    scoreGain += result.scoreGain;
    return result.row;
  });

  return { board: moved, scoreGain };
}

function moveRight(board: Board) {
  const reversed = reverse(board);
  const moved = moveLeft(reversed);

  return {
    board: reverse(moved.board),
    scoreGain: moved.scoreGain,
  };
}

function moveUp(board: Board) {
  const transposed = transpose(board);
  const moved = moveLeft(transposed);

  return {
    board: transpose(moved.board),
    scoreGain: moved.scoreGain,
  };
}

function moveDown(board: Board) {
  const transposed = transpose(board);
  const moved = moveRight(transposed);

  return {
    board: transpose(moved.board),
    scoreGain: moved.scoreGain,
  };
}

function canMove(board: Board) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return true;

      if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) {
        return true;
      }

      if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) {
        return true;
      }
    }
  }

  return false;
}

function tileColor(value: number) {
  const colors: Record<number, string> = {
    2: "#9dd4ff",
    4: "#5eb3ff",
    8: "#2e8dd9",
    16: "#1a5db8",
    32: "#0d3997",
    64: "#00b8d4",
    128: "#00c853",
    256: "#64dd17",
    512: "#ffa726",
    1024: "#ff7043",
    2048: "#ab47bc",
  };

  return colors[value] || "#7b1fa2";
}

export default function TwentyFourtyEight() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [board, setBoard] = useState<Board>(initializeBoard);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const animatingTilesRef = useRef<AnimatingTile[]>([]);
  const boardRef = useRef<Board>(board);
  const tileIdRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const gameOverRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      const now = performance.now();

      // Clear canvas
      ctx.fillStyle = "#c0c0c0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid background
      ctx.fillStyle = "#a0a0a0";
      ctx.strokeStyle = "#808080";
      ctx.lineWidth = 2;
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          const x = 6 + c * (TILE_SIZE + GAP);
          const y = 6 + r * (TILE_SIZE + GAP);
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
          ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
        }
      }

      // Draw animating tiles
      const activeAnimations: AnimatingTile[] = [];
      animatingTilesRef.current.forEach((tile) => {
        const elapsed = now - tile.startTime;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

        const fromX = 6 + tile.fromCol * (TILE_SIZE + GAP) + TILE_SIZE / 2;
        const fromY = 6 + tile.fromRow * (TILE_SIZE + GAP) + TILE_SIZE / 2;
        const toX = 6 + tile.toCol * (TILE_SIZE + GAP) + TILE_SIZE / 2;
        const toY = 6 + tile.toRow * (TILE_SIZE + GAP) + TILE_SIZE / 2;

        const currentX = fromX + (toX - fromX) * progress;
        const currentY = fromY + (toY - fromY) * progress;

        // Draw tile
        ctx.fillStyle = tileColor(tile.value);
        ctx.fillRect(
          currentX - TILE_SIZE / 2,
          currentY - TILE_SIZE / 2,
          TILE_SIZE,
          TILE_SIZE
        );
        ctx.strokeStyle = "#505050";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          currentX - TILE_SIZE / 2,
          currentY - TILE_SIZE / 2,
          TILE_SIZE,
          TILE_SIZE
        );

        // Draw text
        ctx.fillStyle = "#000000";
        ctx.font = "bold 16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(tile.value.toString(), currentX, currentY);

        // Keep track of active animations
        if (progress < 1) {
          activeAnimations.push(tile);
        }
      });

      // Draw static tiles (newly spawned ones without animation)
      boardRef.current.forEach((row, r) => {
        row.forEach((value, c) => {
          if (value === 0) return;

          const isAnimating = animatingTilesRef.current.some(
            (t) => t.toRow === r && t.toCol === c
          );

          if (!isAnimating) {
            const x = 6 + c * (TILE_SIZE + GAP);
            const y = 6 + r * (TILE_SIZE + GAP);

            ctx.fillStyle = tileColor(value);
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = "#505050";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);

            ctx.fillStyle = "#000000";
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(value.toString(), x + TILE_SIZE / 2, y + TILE_SIZE / 2);
          }
        });
      });

      // Update active animations
      animatingTilesRef.current = activeAnimations;

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  function restart() {
    const newBoard = initializeBoard();
    setBoard(newBoard);
    boardRef.current = newBoard;
    setScore(0);
    setGameOver(false);
    gameOverRef.current = false;
    animatingTilesRef.current = [];
    tileIdRef.current = 0;
  }

  function performMove(
    moveFn: (board: Board) => { board: Board; scoreGain: number }
  ) {
    if (gameOverRef.current || animatingTilesRef.current.length > 0) return;

    const result = moveFn(boardRef.current);

    if (boardsEqual(result.board, boardRef.current)) return;

    // Create animation tiles
    const newAnimatingTiles: AnimatingTile[] = [];
    const oldBoard = boardRef.current;

    oldBoard.forEach((row, r) => {
      row.forEach((value, c) => {
        if (value === 0) return;

        // Find where this tile went
        for (let nr = 0; nr < SIZE; nr++) {
          for (let nc = 0; nc < SIZE; nc++) {
            if (result.board[nr][nc] !== 0) {
              // Check if this could be the same tile or a merged result
              if (
                result.board[nr][nc] === value ||
                result.board[nr][nc] === value * 2
              ) {
                const alreadyAnimating = newAnimatingTiles.some(
                  (t) => t.toRow === nr && t.toCol === nc
                );

                if (!alreadyAnimating) {
                  newAnimatingTiles.push({
                    id: tileIdRef.current++,
                    value: result.board[nr][nc],
                    fromRow: r,
                    fromCol: c,
                    toRow: nr,
                    toCol: nc,
                    startTime: performance.now(),
                    isMerged: result.board[nr][nc] === value * 2,
                  });
                  break;
                }
              }
            }
          }
        }
      });
    });

    animatingTilesRef.current = newAnimatingTiles;

    setTimeout(() => {
      const nextBoard = addRandomTile(result.board);
      setBoard(nextBoard);
      boardRef.current = nextBoard;
      setScore((s) => s + result.scoreGain);
      animatingTilesRef.current = [];

      if (!canMove(nextBoard)) {
        setGameOver(true);
        gameOverRef.current = true;
      }
    }, ANIMATION_DURATION + 50);
  }

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          performMove(moveLeft);
          break;
        case "ArrowRight":
          e.preventDefault();
          performMove(moveRight);
          break;
        case "ArrowUp":
          e.preventDefault();
          performMove(moveUp);
          break;
        case "ArrowDown":
          e.preventDefault();
          performMove(moveDown);
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.x;
    const dy = touch.clientY - touchStart.y;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const threshold = 30;

    if (absDx > threshold || absDy > threshold) {
      if (absDx > absDy) {
        if (dx > 0) performMove(moveRight);
        else performMove(moveLeft);
      } else {
        if (dy > 0) performMove(moveDown);
        else performMove(moveUp);
      }
    }

    setTouchStart(null);
  };

  return (
    <div className="flex justify-center items-start pt-2 pb-2 px-2">
      <div className="window w-full max-w-xs">
        <div className="title-bar">
          <div className="title-bar-text">2048</div>
        </div>

        <div className="window-body active p-2">
          {/* Score and Controls */}
          <div className="flex justify-between items-center gap-2 mb-3 pb-2 border-b border-gray-400">
            <div className="flex flex-col items-center">
              <div className="text-xs font-bold text-gray-600">Score</div>
              <div className="text-xl font-bold text-blue-600">{score}</div>
            </div>
            <button
              className="default px-4 py-1 text-sm font-bold active:shadow-inset"
              onClick={restart}
            >
              New
            </button>
          </div>

          {/* Game Over Message */}
          {gameOver && (
            <div className="mb-2 p-2 bg-red-100 border border-red-800 text-center text-xs font-bold text-red-900">
              Game Over!
            </div>
          )}

          {/* Game Board Canvas */}
          <canvas
            ref={canvasRef}
            width={BOARD_SIZE}
            height={BOARD_SIZE}
            className="border-2 border-gray-400 shadow-md mx-auto mb-2 block"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: "none" }}
          />

          {/* Instructions */}
          <div className="p-2 bg-blue-100 border border-blue-400 rounded-sm text-xs text-center">
            <div className="font-bold text-blue-900">Arrow keys or swipe</div>
          </div>
        </div>
      </div>
    </div>
  );
}