class hashedClassManager{
    constructor(){
        this.searchQuery="div";
        this.classList={};
    }

    get(className){
        if(this.classList[className]==undefined)this.search(className);
        return this.classList[className];
        //なかった場合探索する
        //あったらそのまま値を返す
    }
    
    //クラス名からハッシュが付与されたクラス名を探索する
    search(className){
        document.querySelectorAll(this.searchQuery).forEach(e=>{
            if(e.className.indexOf(className)!=-1)this.classList[className]=e.className;
            return;
        });
        throw `Cant search ${className}`;
    }
}

let dbgMode=false;
let currentURI=location.href;
let classMgr=new hashedClassManager();

if(dbgMode)console.log("DLsitePlayAddonがロードされました。デバッグモードが有効です");

//監視
let observer=new MutationObserver(()=>{
    if(currentURI!=location.href){
        currentURI=location.href;
        if(dbgMode)console.log("URLが切り替わりました");

        let nowScr=getCurrentScreen(location.hash);

        //view画面
        let jump=()=>{
            if(document.querySelector(`.${classMgr.get("ImageViewerPageCounter_currentPage")}`)!=null &&
            document.querySelector(`.${classMgr.get("ImageViewerPageCounter_totalPage")}`)!=null){
                //ページ復帰
                let id=getID(location.hash);
                
                chrome.storage.local.get(id, e=>{
                    if(Object.keys(e).length!=0){
                        let data=e[id][getFullPath(location.hash)];
                        if(dbgMode)console.log(data);
                        if(data!=undefined){
                            let currentPage=parseInt(document.querySelector(`.${classMgr.get("ImageViewerPageCounter_currentPage")}`).textContent);
                            let totalPage=parseInt(document.querySelector(`.${classMgr.get("ImageViewerPageCounter_totalPage")}`).textContent);
                            let targetPage=data.page;
                            //読了だった場合復帰しない
                            if(targetPage!=totalPage)
                                for(let i=currentPage;i<targetPage;i++){
                                    document.querySelector(`.${classMgr.get("ImageViewer_imageViewer")}`).click();
                                }
                        }
                    }
                });
            }
            else {if(dbgMode)console.log("リーダーを待機中");setTimeout(jump, 100);}
        };
        if(nowScr==screen.view)jump();
    }

    //tree画面
    if(getCurrentScreen(location.hash)){
        let items=document.querySelectorAll(`.${classMgr.get("WorkTreeList_tree")}>li`);
        if(items.length!=0){
            let getFileType=(info)=>{
                let i=info.indexOf(" - ");
                if(i==-1)return "フォルダ";
                else return info.slice(0,i);
            };

            chrome.storage.local.get(getID(location.hash), (d)=>{
                items.forEach(e => {
                    if(e.classList.contains("modded")==false){
                        let fileName=e.querySelector(`.${classMgr.get("WorkTreeList_filename")}`).textContent;
                        let fileType=getFileType(e.querySelector(`.${classMgr.get("WorkTreeList_info")}`).textContent);
                        if(dbgMode){
                            console.log(getFullPath(location.hash)+(getFullPath(location.hash)==""?"":"/")+fileName+","+fileType);
                        }

                        if(fileType!="フォルダ"&&d[getID(location.hash)]!=undefined && d[getID(location.hash)][getFullPath(location.hash)+(getFullPath(location.hash)==""?"":"/")+fileName]!=undefined){
                            let obj=d[getID(location.hash)][getFullPath(location.hash)+(getFullPath(location.hash)==""?"":"/")+fileName];
                            e.querySelector(`.${classMgr.get("WorkTreeList_info")}`).insertAdjacentHTML("beforebegin",`
                            <div class="addonShowState">
                                <div class="addonReadState" ${obj.page==obj.totalPage?"readComplete":""}><div>${obj.page==obj.totalPage?"読了":"読書中"}</div></div>
                                <div class="addonReadPercent">${Math.round(obj.page/obj.totalPage*100)}%</div>
                            </div>`);    
                        }
                        e.classList.add("modded");
                    }
                });
            });
        }
    }

    //設定画面に追加
    if(getCurrentScreen(location.hash)==screen.settings &&
        document.querySelectorAll(`.${classMgr.get("Settings_settings")}`).length==4 &&
        document.querySelector(".PlayAddonSettingsWrap")==null){
            if(dbgMode)console.log("要素を挿入しました");
            document.querySelector(`.${classMgr.get("Settings_wrapper")}`).insertAdjacentHTML("beforeend", `
            <section class="PlayAddonSettingsWrap">
                <h2>アドオン</h2>
                <ol class="settings_wrap">
                    <li class="settings_li">
                        <button id="addonSaveToFile">
                            <p>読書進捗をファイルに保存</p>
                        </button>
                    </li>
                    <li class="settings_li">
                        <button id="addonLoadFromFile">
                            <p>ファイルから読書進捗を復元</p>
                        </button>
                    </li>
                    <li class="settings_li color_danger">
                        <button id="addonClearData">
                            <p>アドオンのデータを初期化</p>
                        </button>
                    </li>
                </ol>
            </section>
            `);
            document.querySelector("#addonSaveToFile").addEventListener("click", ()=>{
                chrome.storage.local.get(null, (e)=>{
                    let json=JSON.stringify(e, null, "  ");
                    const blob=new Blob([json], {type:"application/json"});
                    let dummy_a=document.createElement("a");
                    document.body.appendChild(dummy_a);
                    dummy_a.href=window.URL.createObjectURL(blob);
                    dummy_a.download="DLsitePlay_Data.json";
                    dummy_a.click();
                    document.body.removeChild(dummy_a);
                });
            });

            document.querySelector("#addonLoadFromFile").addEventListener("click", ()=>{
                let dummy_input=document.createElement("input");
                dummy_input.style.display="none";
                dummy_input.type="file";
                dummy_input.accept="application/json";
                dummy_input.click();
                dummy_input.addEventListener("change", ()=>{
                    chrome.storage.local.get(null, (e)=>{console.log(e);});
                    const reader=new FileReader();
                    reader.onload=(e)=>{
                        if(dbgMode)console.log("復元開始");
                        chrome.storage.local.clear();
                        chrome.storage.local.set(JSON.parse(e.target.result));
                        dummy_input.style.display="block";
                        dummy_input.remove();
                        chrome.storage.local.get(null, (e)=>{console.log(e);});
                    }
                    reader.readAsText(dummy_input.files[0]);
                });
            });

            document.querySelector("#addonClearData").addEventListener("click", ()=>{
                if(window.confirm("本当にアドオンのデータを初期化しますか？（読書進捗がリセットされます）")==true){
                    chrome.storage.local.clear();
                }
            });
        }

    //メニューが開かれたらボタンを表示する
    if(getCurrentScreen(location.hash)==screen.view &&
        document.querySelector(`.${classMgr.get("ImageViewer_imageViewer")}>div>div`)!=null &&
        document.querySelector(`.${classMgr.get("ImageViewer_imageViewer")}>div>div`).childNodes.length!=0&&
        document.querySelector(".PlayAddonSaveBtn")==null){
            
        if(dbgMode)console.log("メニューが開かれました");
        document.querySelectorAll(`.${classMgr.get("ImageViewer_imageViewer")}>div>div>div`)[1].insertAdjacentHTML("afterend", 
        `<div class="PlayAddonSaveBtn ${classMgr.get("ImageViewerControls_bottomButtons")}"><img src="`+chrome.runtime.getURL("res/icon_AddBookmark.svg")+'"></img><div>進み具合を保存</div></div>');

        //しおりボタンを挿入
        // document.querySelector(".Header_headerInner__8f7wn").insertAdjacentHTML("beforeend", 
        // `<div class="PlayAddonBookmarksWrap">
        //     <img class="PlayAddonBookmarksIcon" src="${chrome.runtime.getURL("res/icon_Bookmarks.svg")}"></img>
        //     <div class="PlayAddonBookmarksText">しおり</div>
        // </div>`);

        //イベントリスナ
        document.querySelector(".PlayAddonSaveBtn").addEventListener("touchend", ()=>{
            if(dbgMode){console.log("進み具合が保存されます。 総ページ数:"+document.querySelector(`.${classMgr.get("ImageViewerPageCounter_totalPage")}`).textContent+", ページ:"+document.querySelector(`.${classMgr.get("ImageViewerPageCounter_currentPage")}`).textContent);
            console.log(getID(location.hash)+","+getFileName(location.hash));}
            //案2による実装
            let id=getID(location.hash);
            chrome.storage.local.get(id, (e)=>{
                chrome.storage.local.set(
                    {
                        [id]:
                        Object.assign(e[id]==undefined?{}:e[id],
                            {
                                [getFullPath(location.hash)]:{
                                    page: parseInt(document.querySelector(`.${classMgr.get("ImageViewerPageCounter_currentPage")}`).textContent),
                                    totalPage:parseInt(document.querySelector(`.${classMgr.get("ImageViewerPageCounter_totalPage")}`).textContent)
                                }
                            }
                        )
                    }
                );
                
                //アニメーション
                document.querySelector(".PlayAddonSaveBtn").animate(
                    [{backgroundColor:"#70bcfa"},{backgroundColor:"#1f9aff"}],
                    {duration:500, easing:"ease"}
                );
            });
        });
        //しおりイベントリスナ
        // document.querySelector(".PlayAddonBookmarksWrap").addEventListener("touchend", ()=>{
        //     if(document.querySelector(".PlayAddonMarkListWrap")==undefined){
        //         document.querySelector("body").insertAdjacentHTML("beforeend",
        //         `<div class="PlayAddonMarkListWrap">
        //             <div class="PlayAddonMarkListBox">
        //                 <div class="PlayAddonHeader">
        //                 </div>
        //                 <div class="PlayAddonMarkListContent">
        //                 </div>
        //             </div>
        //         </div>`);
        //     }
        // });
    }

    //メニューにバージョンを表示
    if(document.querySelector(`.${classMgr.get("Menu_nav")}`)!=null &&
        document.querySelector(".addon_version_wrap")==null &&
        200<document.querySelector(`.${classMgr.get("Menu_nav")}`).clientWidth){
            if(dbgMode)console.log("挿入されました");
            document.querySelector(`.${classMgr.get("Menu_nav")}`).insertAdjacentHTML("beforeend", `
                <li class="addon_version_wrap">
                    <div id="addon_Text">DLsitePlay-Addon</div>
                    <div id="addon_version">v${chrome.runtime.getManifest().version}</div>
                </li>
            `);
        }
});
observer.observe(document.querySelector("body"), {childList:true, subtree:true});

let screen={
    library:0,
    tree:1,
    view:2,
    settings:3
}

function getHashArr(hash){
    hash=decodeURI(hash.slice(2, hash.length));
    return hash.split("/");
}
function getID(hash){
    let hashArr=getHashArr(hash);
    return hashArr[1];
}
function getFullPath(hash){
    //フルパスを返す
    let hashArr=getHashArr(hash);
    if(hashArr[3]==undefined)return "";
    let meta=hashArr[3].split("%2F");
    meta[meta.length-1]=meta[meta.length-1].slice(0, (meta[meta.length-1].lastIndexOf(".")<0)?undefined:meta[meta.length-1].lastIndexOf("."));
    console.log(meta);
    let fullpath="";
    for(let i=0;i<meta.length;i++){
        fullpath+=(i==0?"":"/")+meta[i];
    }
    if(fullpath.charAt(0)=="/")fullpath=fullpath.slice(1);
    return fullpath;
}
function getFileName(hash){
    let hashArr=getHashArr(hash);
    let viewMeta=hashArr[3].split("%2F");
    return decodeURI(viewMeta[viewMeta.length-1]);
}
function getParentDir(hash){
    let hashArr=getHashArr(hash);
    let viewMeta=hashArr[3].split("%2F");
    return decodeURI(viewMeta[viewMeta.length-2]);
}
function getCurrentScreen(hash){
    let hashArr=getHashArr(hash);
    // hash=hash.slice(2, hash.length);
    // let hashArr=hash.split("/");
    if(dbgMode)console.log(hashArr[0]+","+hashArr[2]);
    
    switch(hashArr[0]){
        case "library":
            return screen.library;
            break;
        case "work":
            switch(hashArr[2]){
                case "tree":
                    return screen.tree;
                    break;
                case "view":
                    return screen.view;
                    break;
                default:
                    return null;
                    break;
            }
            break;
        case "settings":
            return screen.settings;
            break;
        default:
            return null;
            break;
    }
}