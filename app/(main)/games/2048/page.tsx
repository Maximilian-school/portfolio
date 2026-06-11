"use client";

import React, { useEffect, useState } from "react";

const SIZE = 4;

type Board = number[][];

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

  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      scoreGain += filtered[i];
      filtered[i + 1] = 0;
    }
  }

  const merged = filtered.filter((n) => n !== 0);

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
    0: "bg-gray-200",
    2: "bg-yellow-100",
    4: "bg-yellow-200",
    8: "bg-orange-300 text-white",
    16: "bg-orange-400 text-white",
    32: "bg-orange-500 text-white",
    64: "bg-red-500 text-white",
    128: "bg-yellow-400",
    256: "bg-yellow-500",
    512: "bg-yellow-600 text-white",
    1024: "bg-green-500 text-white",
    2048: "bg-green-700 text-white",
  };

  return colors[value] || "bg-purple-600 text-white";
}

export default function TwentyFourtyEight() {
  const [board, setBoard] = useState<Board>(initializeBoard);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  function restart() {
    setBoard(initializeBoard());
    setScore(0);
    setGameOver(false);
  }

  function performMove(
    moveFn: (board: Board) => { board: Board; scoreGain: number }
  ) {
    if (gameOver) return;

    const result = moveFn(board);

    if (boardsEqual(result.board, board)) return;

    const nextBoard = addRandomTile(result.board);

    setBoard(nextBoard);
    setScore((s) => s + result.scoreGain);

    if (!canMove(nextBoard)) {
      setGameOver(true);
    }
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          performMove(moveLeft);
          break;
        case "ArrowRight":
          performMove(moveRight);
          break;
        case "ArrowUp":
          performMove(moveUp);
          break;
        case "ArrowDown":
          performMove(moveDown);
          break;
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  });

  return (
      <div className="window mx-auto max-w-md w-full">
        <div className="title-bar">
          <div className="title-bar-text">2048</div>
        </div>

        <div className="window-body active">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-bold text-lg">Score</p>
              <p>{score}</p>
            </div>

            <button
              className="default"
              onClick={restart}
            >
              New Game
            </button>
          </div>

          {gameOver && (
            <div className="mb-4 p-2 border border-red-500 bg-red-100 text-center">
              Game Over!
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 bg-gray-400 p-2 rounded">
            {board.flat().map((value, index) => (
              <div
                key={index}
                className={`
                  h-20
                  flex
                  items-center
                  justify-center
                  rounded
                  font-bold
                  text-2xl
                  transition-all
                  ${tileColor(value)}
                `}
              >
                {value !== 0 ? value : ""}
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm">
            Use ← ↑ ↓ → arrow keys to play.
          </div>
        </div>
      </div>
  );
}