import ErrorTemplate from "@/components/error-template";

export default function AuthCodeError() {
    return (
        <ErrorTemplate
            statusCode={400}
            message="Authentication error"
            description="There was an error while doing authentication!"
            reset={() => {}}
            actions={[
                <button
                    key="home"
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
