"use client";

import Link from "next/link";
import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useLayoutEffect,
} from "react";

const DEFAULTS = {
    GRAVITY: 0.4,
    BOUNCE: 0.6,
    FRICTION: 0.01,
};

export default function ErrorTemplate({
    statusCode,
    message,
    description,
    actions,
}: Readonly<{
    statusCode: number;
    message: string;
    description: string;
    reset: () => void;
    actions: React.ReactNode[];
}>) {
    const [offset, setOffset] = useState({ x: 0.5, y: 0.5 });
    const [isDragging, setIsDragging] = useState(false);
    const [grabPoint, setGrabPoint] = useState({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const windowRef = useRef<HTMLDivElement>(null);
    const [clickCount, setClickCount] = useState(0);
    const [hasGravity, setHasGravity] = useState(false);
    const [physicsOptionsMinimized, setPhysicsOptionsMinimized] =
        useState(false);

    const velocityRef = useRef({ x: 0, y: 0 });
    const positionRef = useRef({ x: 0, y: 0 });
    const animFrameRef = useRef<number | null>(null);
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0, t: 0 });
    const dragVelocityRef = useRef({ x: 0, y: 0 });

    const [gravity, setGravity] = useState(DEFAULTS.GRAVITY);
    const [bounce, setBounce] = useState(DEFAULTS.BOUNCE);
    const [friction, setFriction] = useState(DEFAULTS.FRICTION);

    const gravityRef = useRef(DEFAULTS.GRAVITY);
    const bounceRef = useRef(DEFAULTS.BOUNCE);
    const frictionRef = useRef(DEFAULTS.FRICTION);

    const isAngry = clickCount > 0 && !hasGravity;

    const getShakeIntensity = () => {
        if (hasGravity) return "";
        if (clickCount >= 4) return "heavy-shake";
        if (clickCount >= 2) return "light-shake";
        return "";
    };

    const resetPhysics = () => {
        setGravity(DEFAULTS.GRAVITY);
        setBounce(DEFAULTS.BOUNCE);
        setFriction(DEFAULTS.FRICTION);
        gravityRef.current = DEFAULTS.GRAVITY;
        bounceRef.current = DEFAULTS.BOUNCE;
        frictionRef.current = DEFAULTS.FRICTION;
    };

    useLayoutEffect(() => {
        const updateSize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };
        window.addEventListener("resize", updateSize);
        updateSize();
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    useEffect(() => {
        if (!hasGravity) return;
        const tick = () => {
            if (!windowRef.current) return;
            if (isDraggingRef.current) {
                animFrameRef.current = requestAnimationFrame(tick);
                return;
            }
            const wW = windowRef.current.offsetWidth;
            const wH = windowRef.current.offsetHeight;
            const maxX = window.innerWidth - wW;
            const maxY = window.innerHeight - wH;

            velocityRef.current.y += gravityRef.current;
            velocityRef.current.x *= 1 - frictionRef.current;
            positionRef.current.x += velocityRef.current.x;
            positionRef.current.y += velocityRef.current.y;

            if (positionRef.current.y >= maxY) {
                positionRef.current.y = maxY;
                velocityRef.current.y *= -bounceRef.current;
                velocityRef.current.x *= 1 - frictionRef.current;
            }
            if (positionRef.current.y < 0) {
                positionRef.current.y = 0;
                velocityRef.current.y *= -bounceRef.current;
            }
            if (positionRef.current.x >= maxX) {
                positionRef.current.x = maxX;
                velocityRef.current.x *= -bounceRef.current;
            }
            if (positionRef.current.x < 0) {
                positionRef.current.x = 0;
                velocityRef.current.x *= -bounceRef.current;
            }

            setOffset({
                x: maxX > 0 ? positionRef.current.x / maxX : 0.5,
                y: maxY > 0 ? positionRef.current.y / maxY : 0.5,
            });
            animFrameRef.current = requestAnimationFrame(tick);
        };
        animFrameRef.current = requestAnimationFrame(tick);
        return () => {
            if (animFrameRef.current)
                cancelAnimationFrame(animFrameRef.current);
        };
    }, [hasGravity]);

    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0 || !windowRef.current) return;
        const rect = windowRef.current.getBoundingClientRect();
        setGrabPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        lastMouseRef.current = {
            x: e.clientX,
            y: e.clientY,
            t: performance.now(),
        };
        isDraggingRef.current = true;
        setIsDragging(true);
    };

    const onMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isDraggingRef.current || !windowRef.current) return;
            const now = performance.now();
            const dt = now - lastMouseRef.current.t;
            if (dt > 0) {
                const alpha = 0.6;
                dragVelocityRef.current = {
                    x:
                        alpha *
                            (((e.clientX - lastMouseRef.current.x) / dt) * 16) +
                        (1 - alpha) * dragVelocityRef.current.x,
                    y:
                        alpha *
                            (((e.clientY - lastMouseRef.current.y) / dt) * 16) +
                        (1 - alpha) * dragVelocityRef.current.y,
                };
            }
            lastMouseRef.current = { x: e.clientX, y: e.clientY, t: now };
            const winW = windowRef.current.offsetWidth;
            const winH = windowRef.current.offsetHeight;
            const rangeX = window.innerWidth - winW;
            const rangeY = window.innerHeight - winH;
            const newX =
                rangeX > 0
                    ? Math.max(
                          0,
                          Math.min(1, (e.clientX - grabPoint.x) / rangeX),
                      )
                    : 0.5;
            const newY =
                rangeY > 0
                    ? Math.max(
                          0,
                          Math.min(1, (e.clientY - grabPoint.y) / rangeY),
                      )
                    : 0.5;
            positionRef.current = { x: newX * rangeX, y: newY * rangeY };
            setOffset({ x: newX, y: newY });
        },
        [grabPoint],
    );

    const onMouseUp = useCallback(() => {
        if (hasGravity) velocityRef.current = { ...dragVelocityRef.current };
        isDraggingRef.current = false;
        setIsDragging(false);
    }, [hasGravity]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [isDragging, onMouseMove, onMouseUp]);

    const getPositionStyles = (): React.CSSProperties => {
        if (typeof window === "undefined" || !windowRef.current)
            return {
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
            };
        const rangeX = dimensions.width - windowRef.current.offsetWidth;
        const rangeY = dimensions.height - windowRef.current.offsetHeight;
        return {
            left: `${offset.x * rangeX}px`,
            top: `${offset.y * rangeY}px`,
        };
    };

    return (
        <div style={{ position: "fixed", inset: 0, overflow: "hidden" }}>
            <style>{`
                @keyframes light-shake {
                    0% { transform: translate(0,0); }
                    25% { transform: translate(1px, 1px); }
                    50% { transform: translate(-1px, -1px); }
                    75% { transform: translate(1px, -1px); }
                    100% { transform: translate(0,0); }
                }
                @keyframes heavy-shake {
                    0% { transform: translate(0,0); }
                    10% { transform: translate(-3px, -2px); }
                    30% { transform: translate(3px, 2px); }
                    50% { transform: translate(-3px, 2px); }
                    70% { transform: translate(3px, -2px); }
                    90% { transform: translate(-1px, -1px); }
                    100% { transform: translate(0,0); }
                }
                .light-shake { animation: light-shake 0.2s infinite; }
                .heavy-shake { animation: heavy-shake 0.1s infinite; }
                .bubble-container {
                    position: absolute;
                    top: -50px;
                    right: -10px;
                    z-index: 20;
                    pointer-events: none;
                }
            `}</style>

            <div
                ref={windowRef}
                className={`window glass active max-w-md w-full fixed select-none ${getShakeIntensity()}`}
                style={{
                    ...getPositionStyles(),
                    margin: 0,
                    zIndex: 10,
                    backgroundColor: isAngry
                        ? `rgb(${128 + clickCount * 25}, 0, 0)`
                        : undefined,
                }}
            >
                <div
                    className="title-bar"
                    onMouseDown={onMouseDown}
                    style={{
                        cursor: isDragging ? "grabbing" : "grab",
                        backgroundColor: isAngry
                            ? `rgb(${128 + clickCount * 25}, 0, 0)`
                            : undefined,
                    }}
                >
                    <div className="title-bar-text">Error: {statusCode}</div>
                    <div
                        className="title-bar-controls"
                        style={{ position: "relative" }}
                    >
                        <button
                            aria-label="Close"
                            onClick={() =>
                                setClickCount((c) => {
                                    const next = c + 1;
                                    if (next >= 6 && !hasGravity) {
                                        velocityRef.current = {
                                            x: (Math.random() - 0.5) * 20,
                                            y: -15,
                                        };
                                        setHasGravity(true);
                                    }
                                    return next;
                                })
                            }
                        >
                            {isAngry && (
                                <div className="bubble-container">
                                    <div
                                        role="tooltip"
                                        className="is-top is-right
                                        max-w-md
                                        w-screen"
                                    >
                                        {(() => {
                                            switch (clickCount) {
                                                case 1:
                                                    return "Hey, that hurt!";
                                                case 2:
                                                    return "Stop it!";
                                                case 3:
                                                    return "I said stop!";
                                                case 4:
                                                    return "That's it!";
                                                case 5:
                                                    return "I'm breaking free!";
                                                default:
                                                    return "Ouch!";
                                            }
                                        })()}
                                    </div>
                                </div>
                            )}
                        </button>
                    </div>
                </div>
                <div className="window-body has-space">
                    <h1 className="text-2xl">{message}</h1>
                    <p className="mt-2 text-sm">
                        {description}
                        <br />
                        Created by Google Gemini -{" "}
                        <Link
                            href="https://www.youtube.com/watch?v=5aV0f_q1-Jg"
                            target="_blank"
                        >
                            Yes its genai
                        </Link>
                    </p>
                    <div className="flex gap-4 mt-4">{actions}</div>
                </div>
            </div>

            {hasGravity && (
                <div
                    className="window glass active select-none max-w-sm"
                    style={{ position: "fixed", bottom: 20, right: 20 }}
                >
                    <div className="title-bar">
                        <div className="title-bar-text">
                            Physics Engine (The Window Broke)
                        </div>
                        <div className="title-bar-controls">
                            <button
                                aria-label={
                                    physicsOptionsMinimized
                                        ? "Maximize"
                                        : "Minimize"
                                }
                                onClick={() =>
                                    setPhysicsOptionsMinimized(
                                        !physicsOptionsMinimized,
                                    )
                                }
                            />
                        </div>
                    </div>
                    {!physicsOptionsMinimized && (
                        <div className="window-body has-space">
                            <div
                                className="field-row-stacked"
                                style={{ marginBottom: "10px" }}
                            >
                                <label>Gravity: {gravity.toFixed(2)}</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.0001"
                                    value={gravity}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setGravity(val);
                                        gravityRef.current = val;
                                    }}
                                />

                                <label>Bounce: {bounce.toFixed(2)}</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.0001"
                                    value={bounce}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setBounce(val);
                                        bounceRef.current = val;
                                    }}
                                />

                                <label>
                                    Friction: {(friction * 1000).toFixed(0)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="0.1"
                                    step="0.0001"
                                    value={friction}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setFriction(val);
                                        frictionRef.current = val;
                                    }}
                                />
                            </div>
                            <button
                                style={{ width: "100%" }}
                                onClick={resetPhysics}
                            >
                                Reset to Default
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
