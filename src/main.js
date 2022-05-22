let dbgMode=false;
let currentURI=location.href;

if(dbgMode)console.log("DLsitePlayAddonがロードされました。デバッグモードが有効です");

//監視
let observer=new MutationObserver(()=>{
    if(currentURI!=location.href){
        currentURI=location.href;
        if(dbgMode)console.log("URLが切り替わりました");

        let nowScr=getCurrentScreen(location.hash);

        //view画面
        let jump=()=>{
            if(document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz")!=null &&
            document.querySelector(".ImageViewerPageCounter_totalPage__pBHGV")!=null){
                //ページ復帰
                let id=getID(location.hash);
                
                chrome.storage.local.get(id, e=>{
                    if(Object.keys(e).length!=0){
                        let data=e[id][getFullPath(location.hash)];
                        if(dbgMode)console.log(data);
                        if(data!=undefined){
                            let currentPage=parseInt(document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz").textContent);
                            let totalPage=parseInt(document.querySelector(".ImageViewerPageCounter_totalPage__pBHGV").textContent);
                            let targetPage=data.page;
                            //読了だった場合復帰しない
                            if(targetPage!=totalPage)
                                for(let i=currentPage;i<targetPage;i++){
                                    document.querySelector(".ImageViewer_imageViewer__wap0J").click();
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
        let items=document.querySelectorAll(".WorkTreeList_tree__SAoFl>li");
        if(items.length!=0){
            let getFileType=(info)=>{
                let i=info.indexOf(" - ");
                if(i==-1)return "フォルダ";
                else return info.slice(0,i);
            };

            chrome.storage.local.get(getID(location.hash), (d)=>{
                items.forEach(e => {
                    if(e.classList.contains("modded")==false){
                        let fileName=e.querySelector(".WorkTreeList_filename__Hbpch").textContent;
                        let fileType=getFileType(e.querySelector(".WorkTreeList_info__oaT-v").textContent);
                        if(dbgMode){
                            console.log(getFullPath(location.hash)+(getFullPath(location.hash)==""?"":"/")+fileName+","+fileType);
                        }

                        if(fileType!="フォルダ"&&d[getID(location.hash)]!=undefined && d[getID(location.hash)][getFullPath(location.hash)+(getFullPath(location.hash)==""?"":"/")+fileName]!=undefined){
                            let obj=d[getID(location.hash)][getFullPath(location.hash)+(getFullPath(location.hash)==""?"":"/")+fileName];
                            e.querySelector(".WorkTreeList_info__oaT-v").insertAdjacentHTML("beforebegin",`
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

    //メニューが開かれたらボタンを表示する
    if(getCurrentScreen(location.hash)==screen.view &&
        document.querySelector(".ImageViewer_imageViewer__wap0J>div>div")!=null &&
        document.querySelector(".ImageViewer_imageViewer__wap0J>div>div").childNodes.length!=0&&
        document.querySelector(".PlayAddonSaveBtn")==null){
            
        if(dbgMode)console.log("メニューが開かれました");
        document.querySelectorAll(".ImageViewer_imageViewer__wap0J>div>div>div")[1].insertAdjacentHTML("afterend", 
        '<div class="PlayAddonSaveBtn ImageViewerControls_bottomButtons__8YPeD"><img src="'+chrome.runtime.getURL("res/icon_AddBookmark.svg")+'"></img><div>進み具合を保存</div></div>');

        //イベントリスナ
        document.querySelector(".PlayAddonSaveBtn").addEventListener("touchend", ()=>{
            if(dbgMode){console.log("進み具合が保存されます。 総ページ数:"+document.querySelector(".ImageViewerPageCounter_totalPage__pBHGV").textContent+", ページ:"+document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz").textContent);
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
                                    page: parseInt(document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz").textContent),
                                    totalPage:parseInt(document.querySelector(".ImageViewerPageCounter_totalPage__pBHGV").textContent)
                                }
                            }
                        )
                    }
                );    
            });
        });
    }
});
observer.observe(document.querySelector("body"), {childList:true, subtree:true});

let screen={
    library:0,
    tree:1,
    view:2
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
    let fullpath="";
    for(let i=0;i<meta.length;i++){
        fullpath+=(i==0?"":"/")+meta[i];
    }
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
        default:
            return null;
            break;
    }
}