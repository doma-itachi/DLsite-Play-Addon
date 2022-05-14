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

                if(dbgMode)
                    console.log(document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz").textContent+", "+document.querySelector(".ImageViewerPageCounter_totalPage__pBHGV").textContent);

                currentPage=parseInt(document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz").textContent);
                let targetPage=20;
                for(let i=currentPage;i<targetPage;i++){
                    document.querySelector(".ImageViewer_imageViewer__wap0J").click();
                }
            }
            else {console.log("まだ");setTimeout(jump, 100);}
        };
        if(nowScr==screen.view)jump();
    }
    if(getCurrentScreen(location.hash)==screen.view &&
        document.querySelector(".ImageViewer_imageViewer__wap0J>div>div")!=null &&
        document.querySelector(".ImageViewer_imageViewer__wap0J>div>div").childNodes.length!=0&&
        document.querySelector(".PlayAddonFlags")==null){
            
        if(dbgMode)console.log("メニューが開かれました");
        setTimeout(()=>{
            document.querySelector(".ImageViewer_imageViewer__wap0J>div>div>div").innerHTML+=`<div class="PlayAddonFlags"></div>`
            // document.querySelector("#root").innerHTML+=`<div class="PlayAddonSavePage">
            // 進み具合を保存<div>`;
        },2000);
            
    }
});
observer.observe(document.querySelector("body"), {childList:true, subtree:true});

let screen={
    library:0,
    tree:1,
    view:2
}
function getCurrentScreen(hash){
    hash=hash.slice(2, hash.length);
    let hashArr=hash.split("/");
    // if(dbgMode)console.log(hashArr[0]+","+hashArr[2]);
    
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
    return null;
}

// setTimeout(() => {
    
//     let currentPage;
//     currentPage=parseInt(document.querySelector(".ImageViewerPageCounter_currentPage__W7WEz").textContent);

//     let targetPage=0;
//     for(let i=0;i<30;i++){
//     document.querySelector(".ImageViewer_imageViewer__wap0J").click();
//     }
// }, 5000);
