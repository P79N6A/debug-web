module.exports = {
  injectVconsole: true,
  printError: false,
  filter: [
    'otheve.beacon.qq.com',
    '*.dingtalk.com',
    'mazu.m.qq.com',
    'alimei-sub.alibaba.com',
    'player.youku.com',
    'short.weixin.qq.com',
    '*.sogou.com',
    '*.google.com',
    '*.daojia-inc.com',
    '*.yinxiang.com',
    '*.alicdn.com',
    'applog.daojia.com',
    '*.googleapis.com',
    '*.baidu.com',
    '*.growingio.com'
  ],
  replace: [
    // 示例
    {
        // url完全相等时，用foo.html替换
        type: 'equ',
        rule: 'https://dop-open.daojia.com/template/h5/home?jump_from=classpage&phone=15210219311&uid=20093869835271&mobile=15210219311&nolocationparam=1&from=ios&hmsr=DJios&ver=6.4.1&serviceType=1000442&znsr=jgq_shoujishuma&cityid=1&cityId=1&direction=0&cate_id=5005',
        replace: 'foo.html'
    },
    {
        // url正则匹配时，用bar.html替换
        type: 'reg',
        rule: /^https:\/\/discovery-dop.daojia.com\/common\/platformIndex/i,
        replace: 'bar.html'
    }
  ]

};
