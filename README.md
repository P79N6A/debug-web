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

> 1.  经过代理的JS文件在http返回头需要加CORS响应头，例如 <del> "Access-Control-Allow-Origin: * "</del>或"Access-Control-Allow-Origin: 请求的origin "
（因为万能测试环境需要js发送的请求也要带cookie，所以不能用*）

> 2. 静态JS文件引入需要添加 crossorigin="<del>anonymous|</del> use-credentials"  属性

（因为万能测试环境需要js发送的请求也要带cookie，所以不能用crossorigin="anonymous"）

原因：
> 注意：window.onerror() 捕获到message为 "Script error."。同时url 为空，异常行号、列号为空，无error对象。

> 原因：受限于浏览器同源策略，当页面的url 和 script地址不同源时，浏览器为了防止泄露敏感信息，对异常内容和位置信息做了mute处理。


## 使用方法

````
# 第一步，生成anyproxy的证书
npm run init

# 安装依赖
npm install

# 第二步,启动
npm run debug

# 第三步，手机上设置代理到电脑的Ip:8001端口，同时安装证书，这样才能抓取https，之后访问手机页面，页面已经注入了vconsole，这是可以调试了

# 通过电脑ip:8002端口来查看代理请求，就跟fiddler和charles一样。

````

## 配置文件
配置文件在lib/config.js

````js
{
    injectVconsole: true|false, // 默认注入vconsole,默认true
    printError: false, // 是否对script文件注入crossorigin="use-credentials"，默认不注入
    filter:[],// 抓包时不需要关注的域名，提高处理性能
    replace:[{ // 本地文件替换规则
        type: 'equ|reg', // 命中规则的方法，equ是全等，reg是匹配正则
        rule: String| RegExp, // 字符串或正则表达式，分别对应equ和reg类型
        replace: fileName// 本地替换的文件的名字，放在replace文件夹
    }]
}

````

## 默认情况不打印错误行数

不会对html中的js文件注入crossorigin="anonymous|use-credentials"  属性，页面中js报错时，会看不到实际的错误文件和错误行数，只看到"Script error."错误，需要在lib/config.js中printError设置为true，才会注入上述属性。

但是注入crossorigin="anonymous|use-credentials"  属性之后，有的页面的js会不执行，例如

### 存在的问题1
> 在到家App下，因为大类页、列表页，详情页、店铺主页，下单页的js是内置的，所以不会发网络请求，所以这些请求的响应头就没有cors的响应数据，导致JS不执行

> 解决：
> 方法1. html文件替换成本地文件，把内置的js的url修改下，让App不从缓存中拿资源，从网络请求，就会解决
> 方法2. 让客户端的同学打一个无缓存的包，按照之后就不受影响


### 存在的问题2
> 在微信浏览器下加载微信的jssdk，当**给js文件添加"crossorigin="anonymous" " 属性**，js反而不执行了

> 解决：
> 1. 替换返回的HTML文件，把html中的微信的jssdk的url替换成咱们线上服务器上的文件，因为咱们的线上服务器会添加 CORS响应头，其他不变