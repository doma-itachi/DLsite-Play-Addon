console.log("DLsitePlayAddon,ロードされました")
// function main(){
//     console.log("ロードされました");
//     let items = document.querySelectorAll(".WorkTreeList_item__uE0mx");
//     console.log("アイテム数: "+items.length);
//     document.querySelector("canvas").click();
// }
// document.addEventListener("load", main);
let dbgMode=true;
let currentURI=location.href;

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
                // let currentPage;

                let id=getID(location.hash);
                
                chrome.storage.local.get(id,(e)=>{
                    if(Object.keys(e).length!=0){
                        if(dbgMode)
                            console.log(document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz").textContent+", "+document.querySelector(".ImageViewerPageCounter_totalPage__pBHGV").textContent);

                        currentPage=parseInt(document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz").textContent);
                        let targetPage=1;
                        let fileName=getFileName(location.hash);
                        for(let i=0;i<e[id][0].length;i++){
                            console.log(e[id][0][i].fileName+","+fileName);
                            if(e[id][0][i].fileName==fileName){
                                targetPage=e[id][0][i].PageCount;
                                break;
                            }
                        }
                        
                        for(let i=currentPage;i<targetPage;i++){
                            document.querySelector(".ImageViewer_imageViewer__wap0J").click();
                        }
                    }
                })
                

                //ページ保存ボタンをDOMに埋め込む
                // setTimeout(()=>{
                //     console.log("実行されました");document.querySelectorAll(".ImageViewer_imageViewer__wap0J>div>div>div")[1].insertAdjacentHTML("afterend", '<div class="PlayAddonSaveBtn">進み具合を保存</div>');
                // }, 3000);
                // setTimeout(()=>{
                //     // document.querySelector("body").insertAdjacentHTML("afterend", '<div class="PlayAddonSaveBtn">進み具合を保存</div>')
                //     // console.log("実行されました");document.querySelector("body").innerHTML+=`<div class="PlayAddonSaveBtn">進み具合を保存</div>`;
                // }, 15000);
            }
            else {console.log("まだ");setTimeout(jump, 100);}
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

            chrome.storage.local.get(getID(location.hash), ()=>{
                items.forEach(e => {
                    if(e.classList.contains("modded")==false){
                        let fileName=e.querySelector(".WorkTreeList_filename__Hbpch").textContent;
                        let fileType=getFileType(e.querySelector(".WorkTreeList_info__oaT-v").textContent);
                        if(dbgMode){
                            console.log(fileName+","+fileType);
                        }
                        if(fileType=="PDFファイル"){

                            let state;
                            let percent;

                            e.querySelector(".WorkTreeList_info__oaT-v").insertAdjacentHTML("beforebegin",`
                            <div class="addonShowState">
                                <div class="addonReadState"><div>読書中</div></div>
                                <div class="addonReadPercent">49%</div>
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
            if(dbgMode){console.log("進み具合が保存されます。 ページ数:"+document.querySelector(".ImageViewerPageCounter_totalPage__pBHGV").textContent+", ページ:"+document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz").textContent);
            console.log(getID(location.hash)+","+getFileName(location.hash));}
            //案2による実装
            let id=getID(location.hash);
            chrome.storage.local.get(id, (e)=>{
                chrome.storage.local.set(
                    {
                        [id]:
                        Object.assign(e[id]==undefined?{}:e[id],
                            {
                                [getParentDir(location.hash)+getFileName(location.hash)]:{
                                    readState: ReadState.reading,
                                    page: parseInt(document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz").textContent),
                                    totalPage:parseInt(document.querySelector(".ImageViewerPageCounter_totalPage__pBHGV").textContent)
                                }
                            }
                        )
                    }
                );    
            });

            // chrome.storage.local.get(getID(location.hash), (e)=>{
            //     if(e[getID(location.hash)]!=undefined){
            //         chrome.storage.local.set({[getID(location.hash)]:[
            //             e[getID(location.hash)].concat({
            //             FileName:getFileName(location.hash),
            //             ParentDir:getParentDir(location.hash),
            //             ReadState:readState.reading,
            //             PageCount:parseInt(document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz").textContent),
            //             TotalPage:parseInt(document.querySelector(".ImageViewerPageCounter_totalPage__pBHGV").textContent)
            //         })]});
            //     }else{
            //         chrome.storage.local.set({[getID(location.hash)]:[{
            //             FileName:getFileName(location.hash),
            //             ParentDir:getParentDir(location.hash),
            //             ReadState:readState.reading,
            //             PageCount:parseInt(document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz").textContent),
            //             TotalPage:parseInt(document.querySelector(".ImageViewerPageCounter_totalPage__pBHGV").textContent)
            //         }]});
            //     }
//                 if(dbgMode)chrome.storage.local.get(getID(location.hash), (e)=>{console.log(e);});
//             });
        });
    }
});
observer.observe(document.querySelector("body"), {childList:true, subtree:true});

let ReadState={
    unread:0,
    reading:1,
    readed:2
}
let screen={
    library:0,
    tree:1,
    view:2
}

function getHashArr(hash){
    hash=hash.slice(2, hash.length);
    return hash.split("/");
}
function getID(hash){
    let hashArr=getHashArr(hash);
    return hashArr[1];
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

class StorageMgr{
    
}