function saveGameState(state) {
    localStorage.setItem('blobFighterGame', JSON.stringify(state));
}

function loadGameState() {
    const savedState = localStorage.getItem('blobFighterGame');
    return savedState ? JSON.parse(savedState) : null;
}

function clearGameState() {
    localStorage.removeItem('blobFighterGame');
}