"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import SignInForm from "@/components/SignInForm";
import { useRouter } from "next/navigation";

type Player = "X" | "O";
type Board = (Player | null)[];

const WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

function checkWinner(board: Board): Player | "draw" | null {
    for (const [a, b, c] of WIN_LINES) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a] as Player;
        }
    }

    if (board.every(Boolean)) return "draw";
    return null;
}

export default function TicTacToe() {
    const supabase = createClient();

    const [userId, setUserId] = useState<string | null>(null);

    const [matchId, setMatchId] = useState<string | null>(null);
    const [board, setBoard] = useState<Board>(Array(9).fill(null));
    const [player, setPlayer] = useState<Player | null>(null);
    const [turn, setTurn] = useState<Player>("X");
    const [status, setStatus] = useState<string>("idle");
    const [winner, setWinner] = useState<Player | "draw" | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUserId(data.user?.id ?? null);
        };
        loadUser();
    }, []);

    useEffect(() => {
        if (!matchId) return;

        const channel = supabase
            .channel(`match:${matchId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "tictactoe_matches",
                    filter: `id=eq.${matchId}`,
                },
                (payload) => {
                    const row: any = payload.new;

                    setBoard(row.board);
                    setTurn(row.turn);
                    setStatus(row.status);

                    const w = checkWinner(row.board);
                    setWinner(w);
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [matchId]);

    const createMatch = async () => {
        if (!userId) return;

        setLoading(true);

        const { data } = await supabase
            .from("tictactoe_matches")
            .insert({
                player_x: userId,
                board: Array(9).fill(null),
                turn: "X",
                status: "waiting",
            })
            .select()
            .single();

        setMatchId(data.id);
        setPlayer("X");
        setBoard(data.board);
        setStatus(data.status);

        setLoading(false);
    };

    const joinMatch = async () => {
        if (!userId) return;

        const id = prompt("Enter match ID:");
        if (!id) return;

        setLoading(true);

        const { data } = await supabase
            .from("tictactoe_matches")
            .update({
                player_o: userId,
                status: "playing",
            })
            .eq("id", id)
            .is("player_o", null)
            .select()
            .single();

        if (data) {
            setMatchId(id);
            setPlayer("O");
            setBoard(data.board);
            setTurn(data.turn);
            setStatus(data.status);
        }

        setLoading(false);
    };

    const play = async (i: number) => {
        if (!matchId || !player || winner) return;
        if (board[i] || player !== turn) return;

        const newBoard = [...board];
        newBoard[i] = player;

        const result = checkWinner(newBoard);

        const nextTurn: Player = player === "X" ? "O" : "X";

        setBoard(newBoard);
        setTurn(nextTurn);
        setWinner(result);

        await supabase
            .from("tictactoe_matches")
            .update({
                board: newBoard,
                turn: nextTurn,
                status: result ? "finished" : "playing",
                winner: result === "draw" ? "draw" : result,
            })
            .eq("id", matchId);
    };

    const router = useRouter();

    if (!userId) {
        return (
            <SignInForm
                open={true}
                onClose={(wasX) => {
                    if (wasX) {
                        router.push("/games");
                    }
                }}
                help="This game requires you to be signed into an account!"
            />
        );
    }

    if (!matchId) {
        return (
            <div className="p-6 space-y-3">
                <h1 className="text-xl font-bold">Tic Tac Toe Multiplayer</h1>

                <p className="text-sm opacity-70">
                    Logged in as:{" "}
                    {userId ? userId.slice(0, 8) : "not signed in"}
                </p>

                <button onClick={createMatch} disabled={loading || !userId}>
                    Create Match (X)
                </button>

                <button onClick={joinMatch} disabled={loading || !userId}>
                    Join Match (O)
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-3">
            <div className="text-sm opacity-70">
                Match: {matchId} | You: {player} | Turn: {turn} | Status:{" "}
                {status}
            </div>

            {winner && (
                <div className="text-lg font-bold">
                    {winner === "draw" ? "It's a draw 💀" : `${winner} wins 🔥`}
                </div>
            )}

            <div className="grid grid-cols-3 gap-2 w-52">
                {board.map((cell, i) => (
                    <button
                        key={i}
                        onClick={() => play(i)}
                        className="w-16 h-16 border flex items-center justify-center text-2xl"
                    >
                        {cell}
                    </button>
                ))}
            </div>

            <button onClick={() => location.reload()}>Leave Match</button>
        </div>
    );
}
