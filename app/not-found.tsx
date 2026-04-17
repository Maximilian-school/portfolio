"use client";

import ErrorTemplate from "./error-template";

export default function NotFound() {
    return (
        <ErrorTemplate
            statusCode={404}
            message="Page not found"
            reset={() => {}}
            actions={[
                <button
                    key="home"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => {
                        window.location.href = "/";
                    }}
                >
                    Go to Home
                </button>,
            ]}
        />
    );
}
