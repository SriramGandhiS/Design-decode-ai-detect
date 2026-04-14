// --- NAVIGATION & REDIRECT LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const navUploadBtn = document.getElementById('nav-upload-btn');
    const dropZone = document.getElementById('drop-zone');
    
    // Redirect function
    const redirectToAIorNot = () => {
        window.open('https://www.aiornot.com/', '_blank');
    };

    // Nav Button click
    if (navUploadBtn) {
        navUploadBtn.addEventListener('click', redirectToAIorNot);
    }

    // Main Upload Zone Interaction
    if (dropZone) {
        // Click to redirect
        dropZone.addEventListener('click', redirectToAIorNot);

        // Drag and drop interaction (just to trigger the look)
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            // Redirect on drop too!
            redirectToAIorNot();
        });
    }

    console.log("Design Decode: Official AIorNot Redirect Logic Loaded.");
});
