import { useState } from "react";
function Player() {
    const [previewUrl, setPreviewUrl] = useState(null);

    // Example function to get preview
    const fetchPreview = async () => {
        const res = await fetch("https://itunes.apple.com/search?term=crank+playboi+carti&media=music&limit=1");
        const data = await res.json();
        setPreviewUrl(data.results[0]?.previewUrl);
    };

    return (
        <div>
            <button onClick={fetchPreview}>Get Preview</button>

            {previewUrl && (
                <audio controls autoPlay src={previewUrl}></audio>
            )}
        </div>
    )
}

export default Player