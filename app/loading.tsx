export default function LoadingTemplate() {
    return (
        <div className="flex flex-col max-w-4xl mx-auto gap-6">
            <h1 className="text-4xl font-semibold">Please wait</h1>

            <div role="progressbar" className="marquee" />
        </div>
    );
}
