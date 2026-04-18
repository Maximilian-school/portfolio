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
    const [gyroEnabled, setGyroEnabled] = useState(false);

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
    const gyroGravityRef = useRef({ x: 0, y: DEFAULTS.GRAVITY }); // Vector for tilt
    const bounceRef = useRef(DEFAULTS.BOUNCE);
    const frictionRef = useRef(DEFAULTS.FRICTION);

    const isAngry = clickCount > 0 && !hasGravity;

    // --- GYROSCOPE LOGIC ---
    const requestGyro = async () => {
        // We cast to 'any' to prevent TypeScript from complaining about
        // the non-standard requestPermission method during the build.
        const DeviceMoveEvent = DeviceOrientationEvent as any;

        if (
            typeof DeviceMoveEvent !== "undefined" &&
            typeof DeviceMoveEvent.requestPermission === "function"
        ) {
            try {
                const permission = await DeviceMoveEvent.requestPermission();
                if (permission === "granted") {
                    setGyroEnabled(true);
                }
            } catch (e) {
                console.error("Gyroscope permission denied:", e);
            }
        } else {
            // This covers Android and older browsers where permission isn't required
            setGyroEnabled(true);
        }
    };

    useEffect(() => {
        if (!gyroEnabled) return;
        const handleOrientation = (e: DeviceOrientationEvent) => {
            // Gamma: Left/Right tilt (-90 to 90)
            // Beta: Front/Back tilt (-180 to 180)
            const gx = (e.gamma || 0) / 45; // Scale to manageable gravity values
            const gy = (e.beta || 0) / 45;
            gyroGravityRef.current = { x: gx, y: gy };
        };
        window.addEventListener("deviceorientation", handleOrientation);
        return () =>
            window.removeEventListener("deviceorientation", handleOrientation);
    }, [gyroEnabled]);

    // --- PHYSICS TICK ---
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

            // Apply Gyro Gravity if enabled, otherwise use static gravity
            if (gyroEnabled) {
                velocityRef.current.x += gyroGravityRef.current.x;
                velocityRef.current.y += gyroGravityRef.current.y;
            } else {
                velocityRef.current.y += gravityRef.current;
            }

            velocityRef.current.x *= 1 - frictionRef.current;
            velocityRef.current.y *= 1 - frictionRef.current;
            positionRef.current.x += velocityRef.current.x;
            positionRef.current.y += velocityRef.current.y;

            let hitWall = false;

            // Collision Detection with Haptics
            if (positionRef.current.y >= maxY) {
                positionRef.current.y = maxY;
                velocityRef.current.y *= -bounceRef.current;
                hitWall = true;
            } else if (positionRef.current.y < 0) {
                positionRef.current.y = 0;
                velocityRef.current.y *= -bounceRef.current;
                hitWall = true;
            }

            if (positionRef.current.x >= maxX) {
                positionRef.current.x = maxX;
                velocityRef.current.x *= -bounceRef.current;
                hitWall = true;
            } else if (positionRef.current.x < 0) {
                positionRef.current.x = 0;
                velocityRef.current.x *= -bounceRef.current;
                hitWall = true;
            }

            if (hitWall && "vibrate" in navigator) {
                // Short pulse on wall hit
                navigator.vibrate(20);
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
    }, [hasGravity, gyroEnabled]);

    // --- UNIFIED INPUT HANDLERS (PC & MOBILE) ---
    const startDrag = (clientX: number, clientY: number) => {
        if (!windowRef.current) return;
        const rect = windowRef.current.getBoundingClientRect();
        setGrabPoint({ x: clientX - rect.left, y: clientY - rect.top });
        lastMouseRef.current = { x: clientX, y: clientY, t: performance.now() };
        isDraggingRef.current = true;
        setIsDragging(true);
    };

    const handleMove = useCallback(
        (clientX: number, clientY: number) => {
            if (!isDraggingRef.current || !windowRef.current) return;
            const now = performance.now();
            const dt = now - lastMouseRef.current.t;
            if (dt > 0) {
                const alpha = 0.6;
                dragVelocityRef.current = {
                    x:
                        alpha *
                            (((clientX - lastMouseRef.current.x) / dt) * 16) +
                        (1 - alpha) * dragVelocityRef.current.x,
                    y:
                        alpha *
                            (((clientY - lastMouseRef.current.y) / dt) * 16) +
                        (1 - alpha) * dragVelocityRef.current.y,
                };
            }
            lastMouseRef.current = { x: clientX, y: clientY, t: now };
            const winW = windowRef.current.offsetWidth;
            const winH = windowRef.current.offsetHeight;
            const rangeX = window.innerWidth - winW;
            const rangeY = window.innerHeight - winH;
            const newX =
                rangeX > 0
                    ? Math.max(0, Math.min(1, (clientX - grabPoint.x) / rangeX))
                    : 0.5;
            const newY =
                rangeY > 0
                    ? Math.max(0, Math.min(1, (clientY - grabPoint.y) / rangeY))
                    : 0.5;
            positionRef.current = { x: newX * rangeX, y: newY * rangeY };
            setOffset({ x: newX, y: newY });
        },
        [grabPoint],
    );

    // --- REACT EVENT WRAPPERS ---
    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) startDrag(e.clientX, e.clientY);
    };
    const onTouchStart = (e: React.TouchEvent) => {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
    };

    useEffect(() => {
        const mouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
        const touchMove = (e: TouchEvent) => {
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
            if (isDraggingRef.current) e.preventDefault(); // Prevent scrolling while dragging
        };
        const endDrag = () => {
            if (hasGravity)
                velocityRef.current = { ...dragVelocityRef.current };
            isDraggingRef.current = false;
            setIsDragging(false);
        };

        if (isDragging) {
            window.addEventListener("mousemove", mouseMove);
            window.addEventListener("mouseup", endDrag);
            window.addEventListener("touchmove", touchMove, { passive: false });
            window.addEventListener("touchend", endDrag);
        }
        return () => {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseup", endDrag);
            window.removeEventListener("touchmove", touchMove);
            window.removeEventListener("touchend", endDrag);
        };
    }, [isDragging, handleMove, hasGravity]);

    useLayoutEffect(() => {
        const updateSize = () =>
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        window.addEventListener("resize", updateSize);
        updateSize();
        return () => window.removeEventListener("resize", updateSize);
    }, []);

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
        <div
            style={{
                position: "fixed",
                inset: 0,
                overflow: "hidden",
                touchAction: "none",
            }}
        >
            <style>{`
                .light-shake { animation: light-shake 0.2s infinite; }
                .heavy-shake { animation: heavy-shake 0.1s infinite; }
                @keyframes light-shake { 0%, 100% { transform: translate(0,0); } 25% { transform: translate(1px,1px); } 75% { transform: translate(-1px,-1px); } }
                @keyframes heavy-shake { 0%, 100% { transform: translate(0,0); } 20% { transform: translate(-3px,2px); } 40% { transform: translate(3px,-2px); } 60% { transform: translate(-3px,-2px); } 80% { transform: translate(3px,2px); } }
            `}</style>

            <div
                ref={windowRef}
                className={`window glass active max-w-md w-full fixed select-none ${!hasGravity && clickCount >= 4 ? "heavy-shake" : !hasGravity && clickCount >= 2 ? "light-shake" : ""}`}
                style={{
                    ...getPositionStyles(),
                    zIndex: 10,
                    backgroundColor: isAngry
                        ? `rgb(${128 + clickCount * 25}, 0, 0)`
                        : undefined,
                }}
            >
                <div
                    className="title-bar"
                    onMouseDown={onMouseDown}
                    onTouchStart={onTouchStart}
                    style={{
                        cursor: isDragging ? "grabbing" : "grab",
                        backgroundColor: isAngry
                            ? `rgb(${128 + clickCount * 25}, 0, 0)`
                            : undefined,
                    }}
                >
                    <div className="title-bar-text">Error: {statusCode}</div>
                    <div className="title-bar-controls">
                        <button
                            aria-label="Close"
                            onClick={() => {
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
                                });
                            }}
                        />
                    </div>
                </div>
                <div className="window-body has-space">
                    <h1 className="text-2xl">{message}</h1>
                    <p className="mt-2 text-sm">{description}</p>
                    <div className="flex gap-4 mt-4">{actions}</div>
                </div>
            </div>

            {hasGravity && (
                <div
                    className="window glass active select-none max-w-sm"
                    style={{
                        position: "fixed",
                        bottom: 20,
                        right: 20,
                        zIndex: 100,
                    }}
                >
                    <div className="title-bar">
                        <div className="title-bar-text">Gravity Controls</div>
                        <div className="title-bar-controls">
                            <button
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
                            <div className="field-row">
                                <input
                                    id="gyro"
                                    type="checkbox"
                                    checked={gyroEnabled}
                                    onChange={(e) => {
                                        if (e.target.checked) requestGyro();
                                        else setGyroEnabled(false);
                                    }}
                                />
                                <label htmlFor="gyro">
                                    Enable Gyro Gravity
                                </label>
                            </div>
                            <button
                                style={{ width: "100%" }}
                                onClick={() => {
                                    setGravity(DEFAULTS.GRAVITY);
                                    gravityRef.current = DEFAULTS.GRAVITY;
                                    setGyroEnabled(false);
                                }}
                            >
                                Reset Physics
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
