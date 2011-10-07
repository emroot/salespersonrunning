/*
 * Jay Core 0.0.1
 * 
 * Copyright 2011 Tubemogul Inc. (http://tubemogul.com)
 * 
 * http://tubemogul.com
 */
(function(global, undefined){
var JS_PATH = "/static/js/",
	CSS_PATH = "/static/css/",
	PLUGINS_PATH = "/static/js/lib/jay/plugins/",
	CSS_PLUGINS_PATH = "/static/css/lib/jay/",
	JRClass = function () {},
	my = {};
	
	//============================================================================
	// @method my.Class
	// @params body:Object
	// @params SuperClass:function, ImplementClasses:function..., body:Object
	// @return function
	my.Class = function() {
	
		var len = arguments.length,
			body = arguments[len - 1],
			SuperClass = len > 1 ? arguments[0] : null,
			hasImplementClasses = len > 2,
			Class, SuperClassEmpty;
	
		if (body.constructor === Object) {
			Class = function() {};
		} else {
			Class = body.constructor;
			delete body.constructor;
		}
	
		if (SuperClass) {
			SuperClassEmpty = function() {};
			SuperClassEmpty.prototype = SuperClass.prototype;
			Class.prototype = new SuperClassEmpty();
			Class.prototype.constructor = Class;
			Class.Super = SuperClass;
			extend(Class, SuperClass, false);
		}
	
		if (hasImplementClasses)
			for (var i = 1; i < len - 1; i++)
				extend(Class.prototype, arguments[i].prototype, false);    

		extendClass(Class, body);

		return Class;
	};
	
	//============================================================================
	// @method my.extendClass
	// @params Class:function, extension:Object, ?override:boolean=true
	var extendClass = my.extendClass = function(Class, extension, override) {
		if (extension.STATIC) {
			extend(Class, extension.STATIC, override);
			delete extension.STATIC;
		}
		extend(Class.prototype, extension, override)
	};
	
	//============================================================================
	var extend = function(obj, extension, override) {
		var prop;
		if (override === false) {
			for (prop in extension)
				if (!(prop in obj))
					obj[prop] = extension[prop];
		} else {
			for (prop in extension)
				obj[prop] = extension[prop];
			if (extension.toString !== Object.prototype.toString)
				obj.toString = extension.toString;
		}
	};
	
	Jay = global.Jay = {
		Klass: my.Class,
		
		utils: {
			/*
			 * Assign options and callback depending of the context
			 */
			arguments: function(args, scope){
				var options = {},
				 	callback = function(){};
				$.each(args, function(index, argument){
					if(typeof argument == "object")
						options = argument;
					else if(typeof argument == "function")
						callback = argument;
				});	
				if(scope){
					scope.options = options;
					scope.callback = callback;
				}else
					return [options, callback];
			},
			
			/*
			 * Browser check functions
			 */
			browser: {
				isIE: jQuery.browser.msie,
				isIE6: jQuery.browser.msie && parseInt(jQuery.browser.version, 10) == 6,
				isIE7: jQuery.browser.msie && parseInt(jQuery.browser.version, 10) == 7,
				isIE8: jQuery.browser.msie && parseInt(jQuery.browser.version, 10) == 8
			},
			
			url: {
				/*
				 * Check if url is image (jpg|JPG|jpeg|JPEG|gif|GIF|png|PNG)
				 */
				isImage: function(url) {
				    var re = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:jpg|JPG|jpeg|JPEG|gif|GIF|png|PNG))(?:\?([^#]*))?(?:#(.*))?/;
				    return re.test(url);
				},
				
				/*
				 * Check if url is external (different from current domain)
				 */
				isExternal: function(url) {
				    var m = /^((\w+):\/\/\/?)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#;\|]+)?([;\|])?([^\?#]+)?\??([^#]+)?#?(\w*)/.exec(url) || [];
					if(m.length){
						var domain = m[6].replace(/^www\./, "");
					    var re = /^(www\.|http:\/\/)/;
					    return document.domain != domain && re.test(url);
					}
				    return false;
				},
				
				/*
				 * Check if url is internal content (reference to DOM ID)
				 */
				isHTMLContent: function(target) {
				    var regexp = /^(\#{1})([a-zA-Z\-\_]+)$/;
				    return regexp.test(target);
				},
				
				/*
				 * Check if url is Hash (#)
				 */
				isHash: function(target){
					return target == "#";
				},
				
				/*
				 * Check if url is url
				 */
				isUrl: function(s) {
					var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
					return regexp.test(s);
				}
			},
			
			/*
			 * Load JS or CSS File in the header of the document
			 */
			timers: [],
			includes: [],
			include: function(src, path, callback, type){
				var file,
					path,
					type = type || this.type(src);

				if (type == "js"){
					path = (path || JS_PATH) + src + (src.indexOf("?") == -1 ? "?" : "&") + this.timestamp();
					file = document.createElement("script");
			        file.type = "text/javascript";
			        file.src = path;
			        if (callback){
						if(this.browser.isIE6 || this.browser.isIE7 || this.browser.isIE8)
							file.onreadystatechange = function(){
								if(file.readyState == "loaded" || file.readyState == "complete")
									callback();
							}
						else
			            	file.onload = callback;
			        }
				}else if(type == "css"){
					path = (path || CSS_PATH) + src + "?" + this.timestamp();
					file = document.createElement("link");
			        file.rel = "stylesheet";
			        file.href = path;
				}
				
				if(file !== undefined && !this.inArray(file, this.includes)){
					document.getElementsByTagName("head")[0].appendChild(file);
					this.includes.push(file);
				}
			},
			
			/*
			 * Check if value is in array
			 */
			inArray: function(needle, haystack) {
				for(var i in haystack)
					if(haystack[i] == needle) return true;
				return false;
			},
			
			/*
			 * Get object keys
			 */
			keys: function(o){
				var keys = [];
				for(var key in o)
					keys.push(key);
				return keys;
			},
			
			/*
			 * Get size of an object
			 */
			size: function(obj){
				var len = obj.length ? --obj.length : 0;
	  			for (var k in obj)
					if(obj.hasOwnProperty(k))
						len++;
				return len;
			},
			
			/*
			 * Order object
			 */
			order: function(obj, field){
				var sortable = [];
				for (var key in obj)
				      sortable.push(obj[key]);
				sortable.sort(function(a, b) {return a[field] - b[field]})
				var sorted = {};
				for(i = 0; i<sortable.length; i++)
					sorted[sortable[i].key] = sortable[i];
				return sorted;
			},
			
			/*
			 * Load Jay Plugin
			 */
			plugin: function(src){
				var callback = (typeof arguments[arguments.length-1] == "function" ? arguments[arguments.length-1] : function(){});
				var includeCSS = (typeof arguments[1] == "boolean" ? arguments[1] : false);

				this.include("jay."+src+".js", PLUGINS_PATH, callback);
				if(includeCSS)
					this.include("jay."+src+".css", CSS_PLUGINS_PATH);
			},

			/*
			 * Determine type of a file
			 */
			type: function(file){
				return file.replace(/^.*?\.([a-zA-Z0-9]+)$/, "$1");
			},

			/*
			 * Return MD5 from String
			 */
			calcMD5: function(str){
				if(str === undefined)
					var str = this.random();
				return MD5.calc(str);
			},

			/*
			 * Return current unix timestamp
			 */
			timestamp: function(){
				return Math.round(+new Date()/1000);
			},

			/*
			 * Return a random string 
			 */
			random: function(length){
				var 
				chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",
				length = length || 10,
				str = '';
					for (var i=0; i<length; i++) {
						var rnum = Math.floor(Math.random() * chars.length);
						str += chars.substring(rnum,rnum+1);
					}
				return str;
			},
			
			/*
			 * Need to find description here
			 */
			bound: function(value, opt_min, opt_max) {
				if (opt_min != null) value = Math.max(value, opt_min);
				if (opt_max != null) value = Math.min(value, opt_max);
				return value;
			},
			
			/*
			 * Left pad
			 */
			lpad: function(str, padStr, ln){
				while (str.length < length)
				    str = padString + str;
				return str;
			},
			
			/*
			 * Right pad
			 */
			rpad: function(str, padStr, ln){
				while (str.length < length)
				    str = str + padString;
				return str;
			},
			
			/*
			 * Trim right and left
			 */
			trim: function(str, chars) {
				 return this.ltrim(this.rtrim(str, chars), chars);
			},
			
			/*
			 * Left trim
			 */
			ltrim: function(str, chars) {
				chars = chars !== undefined ? chars.toString() : "\s";
				return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
			},
			
			/*
			 * Right trim
			 */
			rtrim: function(str, chars) {
				chars = chars !== undefined ? chars.toString() : "\s";
				return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
			},
			
			clone: function(obj){
				if(obj == null || typeof(obj) != 'object')
					return obj;

				var temp = new obj.constructor();
				for(var key in obj)
					temp[key] = Jay.utils.clone(obj[key]);

				return temp;
			},
			
			color: {
				brighter: function(hex, lum) {
					// validate hex string
					hex = String(hex).replace(/[^0-9a-f]/gi, '');
					if (hex.length < 6) {
						hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
					}
					lum = lum || 0;
					// convert to decimal and change luminosity
					var rgb = "#", c, i;
					for (i = 0; i < 3; i++) {
						c = parseInt(hex.substr(i*2,2), 16);
						c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
						rgb += ("00"+c).substr(c.length);
					}
					return rgb;
				},
				random: function(){
					return Jay.utils.rpad("#"+((1<<24)*Math.random()|0).toString(16), "0", 6);
				},
				interpolate: function(startColor, endColor, maxDepth, depth){
					function d2h(d) {return d.toString(16);}
					function h2d(h) {return parseInt(h,16);}
                	
					if(depth == 0){
					    return startColor;
					}
					if(depth == maxDepth){
					    return endColor;
					}
                	
					var color = "#";
                	
					for(var i=1; i <= 6; i+=2){
					    var minVal = new Number(h2d(startColor.substr(i,2)));
					    var maxVal = new Number(h2d(endColor.substr(i,2)));
					    var nVal = minVal + (maxVal-minVal) * (depth/maxDepth);
					    var val = d2h(Math.floor(nVal));
					    while(val.length < 2){
					        val = "0"+val;
					    }
					    color += val;
					}
					return color;
				}
			},
			
			/*
			 * Math module
			 */
			math: {
				/*
				 * Convert degrees to radians
				 */
				degreesToRadians: function(deg){
					return deg * (Math.PI / 180);
				},
				
				/*
				 * Convert radians to degrees
				 */
				radiansToDegrees: function(rad){
					return rad / (Math.PI / 180);
				},
				
				/*
				 * Check if a number is an float
				 */
				isFloat: function(n){
					return n===+n && n!==(n|0);
				},
				
				/*
				 * Check if a number is a integer
				 */
				isInteger: function(n){
					return n===+n && n===(n|0);
				},
				
				/*
				 * Return max value of array
				 */
				max: function(array){
					return Math.max.apply(Math, array);
				},
				
				percentile: function(array, _int, key){
					var k = array.length*(1/_int),
						f = Math.floor(parseFloat(k));
						return (function(){
							var ret = new Array();
							for(i=0;i<_int;i++)
								ret.push(array[f*i][key]);
							ret.sort();
							return ret;
						})();
				}
			},
			
			format: {
				number_format: function(number, decimals, dec_point, thousands_sep){
					number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
					var n = !isFinite(+number) ? 0 : +number,
					    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
					    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
					    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
					    s = '',
					    toFixedFix = function (n, prec) {
					        var k = Math.pow(10, prec);
					        return '' + Math.round(n * k) / k;
					    };

					s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
					if (s[0].length > 3) {
					    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
					}
					if ((s[1] || '').length < prec) {
					    s[1] = s[1] || '';
					    s[1] += new Array(prec - s[1].length + 1).join('0');
					}
					return s.join(dec);
				},
				
				
				number: function(n){
					return this.number_format(n, 0, '.', ',');
				},

				money: function(n, points, unit){
					return (n < 0 ? '- '+unit+this.number_format(0-n, (points||2), '.', ',') : unit+this.number_format(n, (points||2), '.', ','));
				},

				dollars: function(n, points){
					return this.money(n, points, "$");
				},

				dollars_micro: function(n, points){
					return this.money(n/1000000, points, "$")
				},

				decimal: function(n, points){
					return this.number_format(n, points, '.', '');
				},

				clean: function(n, points){
					return Jay.utils.rtrim(Jay.utils.rtrim(this.number_format(n, points), 0), ".");
				},

				percent: function(n, points){
					var points = 0;
					return points>0 ? Jay.utils.rtrim(Jay.utils.rtrim(this.number_format(n*100, points,'.',','), 0), ".")+ "%" : this.number_format(n*100, points,'.',',')+"%";
				},

				multi_percent: function(n, points){
					var formatted_nums = new Array();
					for(i=0;i<n.length;i++)
						formatted_nums.push(this.percent(n[i], points));
					return formatted_nums;
				//	return implode(" / ", $formatted_nums);
				},	

				already_percent: function(n, points){
					var points = 0;
					return points>0 ? Jay.utils.rtrim(Jay.utils.rtrim(this.number_format(n, points,'.',','), 0), ".")+ "%" : this.number_format(n, points,'.',',')+ "%";
				},

				multi_already_percent: function(n, points){
					var formatted_nums = new Array();
					for(i=0;i<n.length;i++)
						formatted_nums.push(this.already_percent(n[i], points));
					return formatted_nums;
					//return implode(" / ", $formatted_nums);
				},

				kilobytes: function(n, points){
					return this.number_format(n/1024, points,'.',',');
				},

				megabytes: function(n, points){
					return this.number_format(n/1048576, points,'.',',');
				},

				gigabytes: function(n, points){
					return this.number_format(n/1073741824, points,'.',',');
				},
				
				bytes_formatted: function(n, points){
					if(n >= 1073741824) {
					      n/=1073741824;
					      suffix = 'GB';
					   }else if(n >= 1048576) {
					      n/=1048576;
					      suffix = 'MB';
					   }else if(n >= 1024) {
					      n/=1024;
					      suffix = 'KB';
					   }else{
					      suffix = 'bytes';
					   }
					   return this.number_format(n, points,'.',',')+" "+suffix;
				},

				number_abbr: function(n){
					if(n >= 1000000000) {
						n /= 1000000000;
						n = this.number_format(n);
						n += 'B';
					}else if(n >= 1000000) {
						n /= 1000000;
						n = this.number_format(n);
					    n += 'M';
					}else if(n >= 10000) {
						n /= 1000;
						n = this.number_format(n);
						n += 'K';
					} else {
						n = this.number_format(n);
					}
					return n;
				},

				multi_num_abbr: function(n, points){
					var formatted_nums = new Array();
					for(i=0;i<n.length;i++)
						formatted_nums.push(this.number_abbr(n[i], points));
					return formatted_nums;
				},

				number_shorten: function(n){
					if(n >= 1000000000)
						n /= 1000000000;
					else if(n >= 1000000)
						n /= 1000000;
					return Jay.utils.rtrim(Jay.utils.rtrim(this.number_format(n, 2).replace(/\.0$/, ''),0), ".");
				},

				number_shorten_units: function(n){
					if(n >= 1000000000)
						n = 'B';
					else if(n >= 1000000)
						n = 'M';
					else 
						n = '';
					return n;
				},

				number_shorten_with_units: function(n){
					return this.number_shorten(n) + this.number_shorten_units(n);
				},
				
				time_amount: function(s){
					if (!s || s < 1) return '0s';

					var seconds = s%60,
						mins = seconds-s,
						m = mins%60,
						h = Math.floor((mins-m)/60),
						str = "";
                    
					str  = (h>0  ? this.number_format(h) +"h " : '');
					str += (m>0  ? this.number_format(m) +"m " : '');
					str += (s>0  ? this.number_format(s) +"s " : '');

					return Jay.utils.trim(str);
				},
				
				time_amount_minutes: function(m){
					if (!m || m < 60) return '0m';

					var mins = m%60,
						h = (mins-m)/60,
						str = "";

					str  = (h>0  ? this.number_format(h)    +"h " : '');
					str += (m>0  ? this.number_format(mins) +"m " : '');

					return Jay.utils.trim(str);
				}
			}
		}
		
	};
	
	Jay.utils.loader = Jay.Klass({
		constructor: function(element){
			if(this.loader === undefined){
				var $element = typeof element == "object" ? element : $(element);
				this.loader = $("<div>").addClass("jay-utils-loader").hide().appendTo($element);
			}
		},
		show: function(){
			this.loader.show();
		},
		hide: function(){
			this.loader.hide();
		},
		destroy: function(){
			this.loader.remove();
		}
	})

	/*
	 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
	 * Digest Algorithm, as defined in RFC 1321.
	 * Copyright (C) Paul Johnston 1999 - 2000.
	 * Updated by Greg Holt 2000 - 2001.
	 * See http://pajhome.org.uk/site/legal.html for details.
	 */
	var MD5 = {
		hex_chr: "0123456789abcdef",

		/*
		 * Convert a 32-bit number to a hex string with ls-byte first
		 */
		rhex: function(num){
			var str = "";
			for(j = 0; j <= 3; j++)
				str += this.hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) + this.hex_chr.charAt((num >> (j * 8)) & 0x0F);
			return str;
		},

		/*
		 * Convert a string to a sequence of 16-word blocks, stored as an array.
		 * Append padding bits and the length, as described in the MD5 standard.
		 */
		str2blks_MD5: function(str){
			var nblk = ((str.length + 8) >> 6) + 1,
				blks = new Array(nblk * 16);
			for(i = 0; i < nblk * 16; i++) blks[i] = 0;
			for(i = 0; i < str.length; i++)
				blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
			blks[i >> 2] |= 0x80 << ((i % 4) * 8);
			blks[nblk * 16 - 2] = str.length * 8;
			return blks;
		},

		/*
		 * Add integers, wrapping at 2^32. This uses 16-bit operations internally 
		 * to work around bugs in some JS interpreters.
		 */
		add: function(x, y){
			var lsw = (x & 0xFFFF) + (y & 0xFFFF),
				msw = (x >> 16) + (y >> 16) + (lsw >> 16);
			return (msw << 16) | (lsw & 0xFFFF);
		},

		/*
		 * Bitwise rotate a 32-bit number to the left
		 */
		rol: function(num, cnt){
			return (num << cnt) | (num >>> (32 - cnt));
		},

		/*
		 * These functions implement the basic operation for each round of the
		 * algorithm.
		 */
		cmn: function(q, a, b, x, s, t){
			return this.add(this.rol(this.add(this.add(a, q), this.add(x, t)), s), b);
		},
		ff: function(a, b, c, d, x, s, t){
			return this.cmn((b & c) | ((~b) & d), a, b, x, s, t);
		},
		gg: function(a, b, c, d, x, s, t){
			return this.cmn((b & d) | (c & (~d)), a, b, x, s, t);
		},
		hh: function(a, b, c, d, x, s, t){
			return this.cmn(b ^ c ^ d, a, b, x, s, t);
		},
		ii: function(a, b, c, d, x, s, t){
			return this.cmn(c ^ (b | (~d)), a, b, x, s, t);
		},

		/*
		 * Take a string and return the hex representation of its MD5.
		 */
		calc: function(str){
			var x = this.str2blks_MD5(str),
				a =  1732584193,
				b = -271733879,
				c = -1732584194,
				d =  271733878;

			for(i = 0; i < x.length; i += 16){
				olda = a; oldb = b; oldc = c; oldd = d;

				a = this.ff(a, b, c, d, x[i+ 0], 7 , -680876936);
				d = this.ff(d, a, b, c, x[i+ 1], 12, -389564586);
				c = this.ff(c, d, a, b, x[i+ 2], 17,  606105819);
				b = this.ff(b, c, d, a, x[i+ 3], 22, -1044525330);
				a = this.ff(a, b, c, d, x[i+ 4], 7 , -176418897);
				d = this.ff(d, a, b, c, x[i+ 5], 12,  1200080426);
				c = this.ff(c, d, a, b, x[i+ 6], 17, -1473231341);
				b = this.ff(b, c, d, a, x[i+ 7], 22, -45705983);
				a = this.ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
				d = this.ff(d, a, b, c, x[i+ 9], 12, -1958414417);
				c = this.ff(c, d, a, b, x[i+10], 17, -42063);
				b = this.ff(b, c, d, a, x[i+11], 22, -1990404162);
				a = this.ff(a, b, c, d, x[i+12], 7 ,  1804603682);
				d = this.ff(d, a, b, c, x[i+13], 12, -40341101);
				c = this.ff(c, d, a, b, x[i+14], 17, -1502002290);
				b = this.ff(b, c, d, a, x[i+15], 22,  1236535329);    

				a = this.gg(a, b, c, d, x[i+ 1], 5 , -165796510);
				d = this.gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
				c = this.gg(c, d, a, b, x[i+11], 14,  643717713);
				b = this.gg(b, c, d, a, x[i+ 0], 20, -373897302);
				a = this.gg(a, b, c, d, x[i+ 5], 5 , -701558691);
				d = this.gg(d, a, b, c, x[i+10], 9 ,  38016083);
				c = this.gg(c, d, a, b, x[i+15], 14, -660478335);
				b = this.gg(b, c, d, a, x[i+ 4], 20, -405537848);
				a = this.gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
				d = this.gg(d, a, b, c, x[i+14], 9 , -1019803690);
				c = this.gg(c, d, a, b, x[i+ 3], 14, -187363961);
				b = this.gg(b, c, d, a, x[i+ 8], 20,  1163531501);
				a = this.gg(a, b, c, d, x[i+13], 5 , -1444681467);
				d = this.gg(d, a, b, c, x[i+ 2], 9 , -51403784);
				c = this.gg(c, d, a, b, x[i+ 7], 14,  1735328473);
				b = this.gg(b, c, d, a, x[i+12], 20, -1926607734);

				a = this.hh(a, b, c, d, x[i+ 5], 4 , -378558);
				d = this.hh(d, a, b, c, x[i+ 8], 11, -2022574463);
				c = this.hh(c, d, a, b, x[i+11], 16,  1839030562);
				b = this.hh(b, c, d, a, x[i+14], 23, -35309556);
				a = this.hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
				d = this.hh(d, a, b, c, x[i+ 4], 11,  1272893353);
				c = this.hh(c, d, a, b, x[i+ 7], 16, -155497632);
				b = this.hh(b, c, d, a, x[i+10], 23, -1094730640);
				a = this.hh(a, b, c, d, x[i+13], 4 ,  681279174);
				d = this.hh(d, a, b, c, x[i+ 0], 11, -358537222);
				c = this.hh(c, d, a, b, x[i+ 3], 16, -722521979);
				b = this.hh(b, c, d, a, x[i+ 6], 23,  76029189);
				a = this.hh(a, b, c, d, x[i+ 9], 4 , -640364487);
				d = this.hh(d, a, b, c, x[i+12], 11, -421815835);
				c = this.hh(c, d, a, b, x[i+15], 16,  530742520);
				b = this.hh(b, c, d, a, x[i+ 2], 23, -995338651);

				a = this.ii(a, b, c, d, x[i+ 0], 6 , -198630844);
				d = this.ii(d, a, b, c, x[i+ 7], 10,  1126891415);
				c = this.ii(c, d, a, b, x[i+14], 15, -1416354905);
				b = this.ii(b, c, d, a, x[i+ 5], 21, -57434055);
				a = this.ii(a, b, c, d, x[i+12], 6 ,  1700485571);
				d = this.ii(d, a, b, c, x[i+ 3], 10, -1894986606);
				c = this.ii(c, d, a, b, x[i+10], 15, -1051523);
				b = this.ii(b, c, d, a, x[i+ 1], 21, -2054922799);
				a = this.ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
				d = this.ii(d, a, b, c, x[i+15], 10, -30611744);
				c = this.ii(c, d, a, b, x[i+ 6], 15, -1560198380);
				b = this.ii(b, c, d, a, x[i+13], 21,  1309151649);
				a = this.ii(a, b, c, d, x[i+ 4], 6 , -145523070);
				d = this.ii(d, a, b, c, x[i+11], 10, -1120210379);
				c = this.ii(c, d, a, b, x[i+ 2], 15,  718787259);
				b = this.ii(b, c, d, a, x[i+ 9], 21, -343485551);

				a = this.add(a, olda);
				b = this.add(b, oldb);
				c = this.add(c, oldc);
				d = this.add(d, oldd);
			}
			return this.rhex(a) + this.rhex(b) + this.rhex(c) + this.rhex(d);
		}
	};
	
	var initializing = false,
		fnTest = /xyz/.test(function () {
			xyz;
		}) ? /\b_super\b/ : /.*/;

	// Create a new Class that inherits from this class
	JRClass.extend = function (prop) {
		var _super = this.prototype;
		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;
		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ? (function (name, fn) {
				return function () {
					var tmp = this._super;
					// Add a new ._super() method that is the same method
					// but on the super-class
					this._super = _super[name];
					// The method only need to be bound temporarily, so we
					// remove it when we're done executing
					var ret = fn.apply(this, arguments);
					this._super = tmp;
					return ret;
				};
			})(name, prop[name]) : prop[name];
		}
	    
		// The dummy class constructor
	    function JRClass() {
			// All construction is actually done in the init method
			if (!initializing && this.init) this.init.apply(this, arguments);
		}
	    // Populate our constructed prototype object
	    JRClass.prototype = prototype;
	    // Enforce the constructor to be what we expect
	    JRClass.constructor = JRClass;
	    // And make this class extendable
	    JRClass.extend = arguments.callee;
	    return JRClass;
	  };
	
}(this));