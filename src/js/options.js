const settings={
    isEnable:true,
    autoSkip:true,
    isDebugMode:false,
}

document.querySelector("#button_back").addEventListener("touchend", e=>{
    history.back();
});

//コンフィグのロード
// chrome.storage.local.get("settings", json=>{
//     json.isEnable
// });

//リセットボタン
document.querySelector("#button_reset").addEventListener("touchend", ()=>{
    if(window.confirm("本当に初期化しますか？")){
        chrome.storage.local.clear();
    }
});

document.querySelectorAll("input").forEach((e)=>{
    e.addEventListener("touchend", saveSettings);
});

function saveSettings(){
    
}

loadSettings();
function loadSettings(){
    chrome.storage.local.get("settings", (e)=>{
        Object.assign(settings, e);
        applySettings(settings);
    });
}

function applySettings(json){
    document.querySelector("#key_isEnable").checked=json.isEnable;
    document.querySelector("#key_autoSkip").checked=json.autoSkip;
    document.querySelector("#key_isDebugMode").checked=json.isDebugMode;
}