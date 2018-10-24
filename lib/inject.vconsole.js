// var fs = require('fs');
module.exports = {
	*beforeSendResponse(req, res) {
		let { response } = res;
		let { header, body } = response;
		//if is js,response header add cors header
		//console.log(req['requestOptions']['headers']);
		let reqPath = req['requestOptions']['path'];
		let origin = req['requestOptions']['headers']['Origin'];
		if (header['Content-Type'] && header['Content-Type'].match(/application\/(x-)?javascript/)) {
			console.log('reqPat:%s', reqPath);
			if (!header['Access-Control-Allow-Origin']) {
				header['Access-Control-Allow-Origin'] = '*';
				//header['Vary'] = 'Origin';
			} else {
				if (origin) {
					header['Access-Control-Allow-Origin'] = origin;
					header['Vary'] = 'Origin';
				}
			}


			response.header = header;
		}

		//if is html, inject vconsole.js
		if (/html/i.test(response.header['Content-Type'])) {
			let document = body.toString();
			document = document.replace(
				/<head(.*)>/i,
				`<head$1>
           <script src="//static.daojia.com/assets/other/test/vconsole.min.js" crossorigin></script>
        `
			);
			document = document.replace(/<script\s/gi, '<script crossorigin ');
			response.body = new Buffer(document);
		}

		return { response };
	}
};
