var fs = require('fs')
var path = require('path')
var minimatch = require('minimatch')
var config = require('./config')
var replaceRules = config['replace']
if (!Array.isArray(replaceRules)) {
	throw `rule ${replaceRules} is not Array!`
}

var filterConf = config['filter']
if (!Array.isArray(filterConf)) {
	throw `filterConf ${filterConf} is not Array!`
}

module.exports = {
	*beforeSendResponse(req, res) {
		let { response } = res
		let { header, body } = response

		let reqUrl = req.url
		let origin = req['requestOptions']['headers']['Origin']
		let hostName = req['requestOptions']['hostname']
		let refer = req['requestOptions']['headers']['Referer']

		//过滤host列表里的请求直接pass
		for (let host of filterConf) {
			if (minimatch(hostName, host)) {
				console.info(`\r\n..................${hostName} is filtered.............\r\n`)
				return null
			}
		}

		//处理请求资源的origin
		if (!origin && refer) {
			let res = refer.match(/^https?:\/\/[\w\.:\d]+\//)
			if (res !== null) {
				origin = res[0]
				console.info(`\r\n..................origin is not got,use refer origin ${origin} as origin .............\r\n`)
			}
		}

		console.log('\r\n..................req url :%s.............\r\n', req.url)

		// 处理相应头
		if (header['Content-Type'] && header['Content-Type'].match(/application\/(x-)?javascript/)) {
			console.log(`origin:${origin}`)
			header['Access-Control-Allow-Origin'] = origin || '*'
			header['Vary'] = 'Origin'
			header['Access-Control-Allow-Credentials'] = 'true'
			delete header['cache-control']
			delete header['Cache-Control']
			header['Cache-Control'] = 'no-cache'

			response.header = header
		}

		// 处理响应体
		// 根据配置的规则对每一个请求的url进行匹配
		for (let item of replaceRules) {
			let match = false
			switch (item.type) {
				case 'equ':
					let rule = item.rule
					if (reqUrl === rule) {
						match = true
						console.log(`\r\n..................match [equ] rule, url:${reqUrl},url:${rule}.............\r\n`)
					}
					break
				case 'reg':
					let reg = item.rule
					if (reqUrl.match(reg) !== null) {
						match = true
						console.log(`\r\n..................match [reg] rule, url:${reqUrl},reg:${reg}.............\r\n`)
					}
					break
				default:
					break
			}

			// 命中
			if (match) {
				let replaceFile = item.replace
				let replace = `../replace/${replaceFile}`
				let f = path.resolve(__dirname, replace)
				let document = fs.readFileSync(f, 'utf8')
				response.body = new Buffer(document)
				return { response }
			}
		}

		//if is html, inject vconsole.js
		if (/html/i.test(response.header['Content-Type'])) {
			let document = body.toString()
			if (config['injectVconsole']) {
				document = document.replace(
					/<head(.*)>/i,
					`<head$1>
                    <script src="//static.daojia.com/assets/other/test/vconsole.min.js" crossorigin></script>
                `
				)
			}

			// document = document.replace(/<script\s/gi, '<script crossorigin ');
			// crossorigin默认属性是anonymous，请求不发送cookie
			if (config['printError']) {
				/*eslint-disable*/
				document = document.replace(/((?<!")<script\s).*?(?=src=)/gi, '<script crossorigin="use-credentials" ')
			}

			response.body = new Buffer(document)
		}

		return { response }
	}
}
