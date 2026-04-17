"use client";

import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useLayoutEffect,
} from "react";

export default function ErrorTemplate({
    statusCode,
    message,
    actions,
}: Readonly<{
    statusCode: number;
    message: string;
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
    const velocityRef = useRef({ x: 0, y: 0 });
    const positionRef = useRef({ x: 0, y: 0 });
    const animFrameRef = useRef<number | null>(null);
    const isDraggingRef = useRef(false);
    const lastMouseRef = useRef({ x: 0, y: 0, t: 0 });
    const dragVelocityRef = useRef({ x: 0, y: 0 });

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

        const GRAVITY = 0.4;
        const BOUNCE = 0.6;
        const FRICTION = 0.98;

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

            velocityRef.current.y += GRAVITY;
            velocityRef.current.x *= FRICTION;

            positionRef.current.x += velocityRef.current.x;
            positionRef.current.y += velocityRef.current.y;

            if (positionRef.current.y >= maxY) {
                positionRef.current.y = maxY;
                velocityRef.current.y *= -BOUNCE;
                velocityRef.current.x *= FRICTION;
            }

            if (positionRef.current.y < 0) {
                positionRef.current.y = 0;
                velocityRef.current.y *= -BOUNCE;
            }

            if (positionRef.current.x >= maxX) {
                positionRef.current.x = maxX;
                velocityRef.current.x *= -BOUNCE;
            }

            if (positionRef.current.x < 0) {
                positionRef.current.x = 0;
                velocityRef.current.x *= -BOUNCE;
            }

            setOffset({
                x: maxX > 0 ? positionRef.current.x / maxX : 0.5,
                y: maxY > 0 ? positionRef.current.y / maxY : 0.5,
            });

            animFrameRef.current = requestAnimationFrame(tick);
        };

        animFrameRef.current = requestAnimationFrame(tick);

        return () => {
            if (animFrameRef.current !== null) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [hasGravity]);

    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0 || !windowRef.current) return;
        const rect = windowRef.current.getBoundingClientRect();
        setGrabPoint({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        lastMouseRef.current = {
            x: e.clientX,
            y: e.clientY,
            t: performance.now(),
        };
        dragVelocityRef.current = { x: 0, y: 0 };
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

            const targetX = e.clientX - grabPoint.x;
            const targetY = e.clientY - grabPoint.y;

            const newX =
                rangeX > 0 ? Math.max(0, Math.min(1, targetX / rangeX)) : 0.5;
            const newY =
                rangeY > 0 ? Math.max(0, Math.min(1, targetY / rangeY)) : 0.5;

            positionRef.current = { x: newX * rangeX, y: newY * rangeY };
            setOffset({ x: newX, y: newY });
        },
        [grabPoint],
    );

    const onMouseUp = useCallback(() => {
        if (hasGravity) {
            velocityRef.current = {
                x: dragVelocityRef.current.x,
                y: dragVelocityRef.current.y,
            };
        }
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
        if (typeof window === "undefined" || !windowRef.current) {
            return {
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
            };
        }
        const rangeX = dimensions.width - windowRef.current.offsetWidth;
        const rangeY = dimensions.height - windowRef.current.offsetHeight;

        return {
            left: `${offset.x * rangeX}px`,
            top: `${offset.y * rangeY}px`,
        };
    };

    return (
        <>
            <div
                ref={windowRef}
                className="window glass active max-w-md w-full fixed select-none"
                style={{
                    ...getPositionStyles(),
                    margin: 0,
                    zIndex: 9999,
                }}
            >
                <div
                    className="title-bar"
                    onMouseDown={onMouseDown}
                    style={{ cursor: isDragging ? "grabbing" : "grab" }}
                >
                    <div className="title-bar-text">Error: {statusCode}</div>
                    <div className="title-bar-controls">
                        <button
                            aria-label="Close"
                            onClick={() => {
                                setClickCount((c) => {
                                    const next = c + 1;
                                    if (next >= 5) {
                                        if (!hasGravity && windowRef.current) {
                                            const wW =
                                                windowRef.current.offsetWidth;
                                            const wH =
                                                windowRef.current.offsetHeight;
                                            const rangeX =
                                                window.innerWidth - wW;
                                            const rangeY =
                                                window.innerHeight - wH;
                                            positionRef.current = {
                                                x: offset.x * rangeX,
                                                y: offset.y * rangeY,
                                            };
                                            velocityRef.current = {
                                                x: (Math.random() - 0.5) * 6,
                                                y: -4,
                                            };
                                        }
                                        setHasGravity(true);
                                    }
                                    return next;
                                });
                            }}
                        />
                    </div>
                </div>
                <div className="window-body has-space">
                    <h1 className="text-2xl">{message}</h1>
                    <div className="flex gap-4 mt-4">{actions}</div>
                </div>
            </div>

            <div
                role="tooltip"
                className="is-top w-128 is-left !fixed select-none"
                style={{
                    bottom: "20px",
                    right: "20px",
                    zIndex: 10000,
                    whiteSpace: "pre-wrap",
                    pointerEvents: "none",
                }}
            >
                Q: Was making this window draggable really nessasary?{"\n"}
                A: No, but it's a nice touch!
            </div>
        </>
    );
}
