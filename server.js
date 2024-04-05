// 小步測試!!! 一步一步累積確定是否程式正確，才不會寫了一堆發現有錯誤，挫折會很大
// 測試 node 環境是否正常
// console.log("hello");

// 建立一個server
const http = require("http");
// const { v4: uuidv4 } = require("uuid");

// 原本的方式
// http.createServer(function(request,response){
//   response.writeHead(200,{"Content-Type":"text/html"});
//   response.write('<h1>h1 title</h1>');
//   response.end();
// }).listen(1234);
// 新的宣告方式
// const requestListener = (req, res) => {
//   console.log(req.url);
//   console.log(req.method);
//   res.writeHead(200, { "Content-Type": "text/plain" });
//   res.write("Hello");
//   res.end();
// };

// const server = http.createServer(requestListener);
// server.listen(3005);

// 利用 request 做判斷
// const requestListener = (req, res) => {
//   const headers = { "Content-Type": "text/plain" };
//   console.log(req.url);
//   console.log(req.method);
//   if(req.url == '/' && req.method == 'GET'){
//     // 首頁使用 GET 請求的時候
//     res.writeHead(200, headers);
//     res.write("index");
//   }else if(req.url == '/' && req.method == 'DELETE'){
//     // 首頁使用刪除的時候
//     res.writeHead(200, headers);
//     res.write("刪除成功");
//   }else{
//     res.writeHead(404, headers);
//     res.write("not found 404");
//   }
//   res.end();
// };

// const requestListener = (req, res) => {
//   const headers = { // 設定表頭
//     "Access-Control-Allow-Headers":
//       "Content-Type, Authorization, Content-Length, X-Requested-With",
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
//     "Content-Type": "application/json",
//   };
//   console.log(req.url);
//   console.log(req.method);
//   if (req.url == "/" && req.method == "GET") {
//     // 首頁使用 GET 請求的時候
//     res.writeHead(200, headers);
//     res.write( // 回傳JSON格式
//       JSON.stringify({
//         "status": "success",
//         "data": [],
//       })
//       // {
//       //   "status": "success",
//       //   "data": [],
//       // }
//     );
//   } else {
//     res.writeHead(404, headers);
//     res.write( // 回傳JSON格式
//     JSON.stringify({
//       "status": "false",
//       "message": "無此網站路由",
//     })
//   );  }
//   res.end();
// };

// 設定 option api
// const requestListener = (req, res) => {
//   const headers = { // 設定表頭
//     "Access-Control-Allow-Headers":
//       "Content-Type, Authorization, Content-Length, X-Requested-With",
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
//     "Content-Type": "application/json",
//   };
//   console.log(req.url);
//   console.log(req.method);
//   if (req.url == "/" && req.method == "GET") {
//     // 首頁使用 GET 請求的時候
//     res.writeHead(200, headers);
//     res.write( // 回傳JSON格式
//       JSON.stringify({
//         "status": "success",
//         "data": [],
//       })
//     );
//   } else if (req.method == "OPTIONS"){
//     // 因為有些時候有 preflight 網路請求，要記得設定這個避免抓不到
//     res.writeHead(200,headers);
//     res.end();
//   } else {
//     res.writeHead(404, headers);
//     res.write( // 回傳JSON格式
//     JSON.stringify({
//       "status": "false",
//       "message": "無此網站路由",
//     })
//   );  }
//   res.end();
// };

const errorHandle = require('./errorHandle');
// 新增 GET API
const { v4: uuidv4 } = require("uuid");
let todos = []; // 暫存在記憶體

const requestListener = (req, res) => {
  const headers = {
    // 設定表頭
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  if (req.url == "/todos" && req.method == "GET") {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos,
      })
    );
    res.end();
  } else if (req.url == "/todos" && req.method == "POST") {
    req.on("end", () => {
      try { // 使用try catch避免出錯中斷
        const title = JSON.parse(body).title;
        if (title !== undefined) { // 當成功轉換成物件，需判斷是否含有title屬性
          const todo = {
            // 準備將進來的資料儲存成目標格式
            title: title,
            id: uuidv4(),
          };
          todos.push(todo);
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              data: todos,
            })
          );
          res.end();
        } else {
          errorHandle(res);
          // res.writeHead(400, headers);
          // res.write(
          //   JSON.stringify({
          //     status: "false",
          //     message: "欄位未填寫正確，或無此todo id",
          //   })
          // );
          // res.end();
        }
      } catch (error) {
        console.log("程式出錯拉");
        errorHandle(res);
        // res.writeHead(400, headers);
        // res.write(
        //   JSON.stringify({
        //     status: "false",
        //     message: "欄位未填寫正確，或無此todo id",
        //   })
        // );
        // res.end();
      }
    });
  } else if(req.url == "/todos" && req.method == "DELETE"){
    // todos = [];
    todos.length = 0;
    res.writeHead(200,headers);
    res.write(JSON.stringify({
      status : "success",
      data: todos
    }));
    res.end();
  } else if(req.url.startsWith("/todos/") && req.method == "DELETE"){
    // 檢查url的開頭是否正確 以及 方法是否為刪除
    const deleteId = req.url.split("/").pop();
    const deleteIndex = todos.findIndex(item => item.id === deleteId);
    if(deleteIndex !== -1){ // 當索引值-1表示陣列內沒有該資料
      // 當索引值為正確的時後才進行刪除
      todos.splice(deleteIndex,1);
      res.writeHead(200,headers);
      res.write(JSON.stringify({
        status : "success",
        data: todos
      }));
      res.end();
    } else {
      errorHandle(res);
    }
  } else if(req.url.startsWith("/todos/") && req.method == "PATCH"){
    // 檢查url的開頭是否正確 以及 方法是否為修改
    req.on("end",() => {
      try{
        const patchId = req.url.split("/").pop();
        const patchIndex = todos.findIndex(item => item.id === patchId);
        const title = JSON.parse(body).title;
        if(patchIndex !== -1 && title !== undefined){ // 當索引值-1表示陣列內沒有該資料
          // 當索引值為正確的時後才進行修改
          todos[patchIndex].title = title;
          res.writeHead(200,headers);
          res.write(JSON.stringify({
            status : "success",
            data: todos
          }));
          res.end();
        } else {
          errorHandle(res);
        }
      }catch(error){
        errorHandle(res);
      }
    })
  } else if (req.method == "OPTIONS") {
    // 因為有些時候有 preflight 網路請求，要記得設定這個避免抓不到
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      // 回傳JSON格式
      JSON.stringify({
        status: "false",
        message: "無此網站路由",
      })
    );
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);
