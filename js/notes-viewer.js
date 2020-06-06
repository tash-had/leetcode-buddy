function injectNotesToDom(notesJson) {
    // html -> raw txt
    for (k in notesJson) {
        var notesRaw = notesJson[k]["notes"];
        notesJson[k]["notes"] = notesRaw.replace(/<\/?[^>]+(>|$)/g, "");;
    }
    var notesDisplayDiv = document.getElementById("notesDisplayDiv");
    var dataStr = JSON.stringify(notesJson, undefined, 4);

    var preEl = document.createElement('pre');
    preEl.innerHTML = dataStr;

    notesDisplayDiv.appendChild(preEl);

}

document.addEventListener('DOMContentLoaded', () => {
    var p_store = {};

    chrome.storage.sync.get('lc_buddy_p_store', (store) => {
        if (store['lc_buddy_p_store'] === undefined) {
            chrome.storage.sync.set({
                lc_buddy_p_store: {}
            });
        } else {
            p_store = store['lc_buddy_p_store'];
        }
        injectNotesToDom(p_store);
    });
})