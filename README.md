# debug-web
启动anyproxy，自动插入vconsole，对html进行修改，对js添加cors响应，来捕获window.onerror
避免手动在页面中注入vconsole


## 原理
1. 对经过代理的html文件注入[改造过的vconsole,官方已合入](https://github.com/winnieBear/vconsole),
主要改造点：
- 使用时不用new 一个实例，只需要引入js即可
  - 当页面有错误或异常发生时，自动hook window.onerror，能把错误信息爆出来，展示在vconsole界面

  线上地址引用地址：//static.daojia.com/assets/other/test/vconsole.min.js

2. 为了当发生错误或异常时，能捕获到js报错的文件和行数，做了两件事：
> 1.  经过代理的JS文件在http返回头需要加CORS响应头，例如  "Access-Control-Allow-Origin: * "或"Access-Control-Allow-Origin: 请求的origin "

> 2. 静态JS文件引入需要添加 "crossorigin="anonymous" " 属性

原因：
> 注意：window.onerror() 捕获到message为 "Script error."。同时url 为空，异常行号、列号为空，无error对象。

> 原因：受限于浏览器同源策略，当页面的url 和 script地址不同源时，浏览器为了防止泄露敏感信息，对异常内容和位置信息做了mute处理。


## 使用方法

````
# 第一步，生成anyproxy的证书
npm run init

# 第二步,启动
npm run debug

# 第三步，手机上设置代理到电脑的8001端口，同时安装证书，这样才能抓取https，之后访问手机页面，页面已经注入了vconsole，这是可以调试了

````

## 存在的问题

> 在微信浏览器下加载微信的jssdk或者在到家App下，加载cordova的js，当**给js文件添加"crossorigin="anonymous" " 属性**，js反而不执行了

> 解决：

> 1. 静态JS文件替换成咱们线上服务器上的文件，因为咱们的线上服务器会添加 CORS响应头，其他不变